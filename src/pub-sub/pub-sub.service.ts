import * as v8 from 'v8';
import { Observable } from 'rxjs';
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ClientRedis } from '@nestjs/microservices';
import { v4 as uuid } from 'uuid';

import { REDIS_PUB_SUB_CLIENT } from '../redis/redis.constants';

type FreebleObservable<T> = Observable<T> & { unsubscribe: () => void };
type RedisPubClient = {
  publish(channel: string, message: string): Promise<number>;
};
type RedisSubClient = {
  subscribe(channel: string): Promise<number>;
  unsubscribe(channel: string): Promise<number>;
  on(event: string, listener: (...args: any[]) => void): void;
  removeListener(event: string, listener: (...args: any[]) => void): void;
};
type TopicCallback = (data: unknown) => void;

@Injectable()
export class PubSubService implements OnModuleDestroy {
  private readonly topics = new Map<string, Map<string, TopicCallback>>();
  private initializationPromise: Promise<void> | null = null;
  private pubClient?: RedisPubClient;
  private subClient?: RedisSubClient;

  constructor(
    @Inject(REDIS_PUB_SUB_CLIENT)
    private readonly redisClient: ClientRedis,
  ) {
    this.ensureInitialized().catch(() => undefined);
  }

  async onModuleDestroy(): Promise<void> {
    this.subClient?.removeListener('messageBuffer', this.handleMessageBuffer);
    this.topics.clear();
    if (this.redisClient) {
      await this.redisClient.close();
    }
    this.pubClient = undefined;
    this.subClient = undefined;
    this.initializationPromise = null;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeRedisClients();
      this.initializationPromise.catch(() => {
        this.initializationPromise = null;
      });
    }

    await this.initializationPromise;
  }

  private async initializeRedisClients(): Promise<void> {
    await this.redisClient.connect();
    const [pubClient, subClient] =
      this.redisClient.unwrap<[RedisPubClient, RedisSubClient]>();

    this.pubClient = pubClient;
    this.subClient = subClient;
    this.subClient.on('messageBuffer', this.handleMessageBuffer);
  }

  private readonly handleMessageBuffer = (channel: Buffer, message: Buffer) => {
    const topic = channel.toString();
    const subscribers = this.topics.get(topic);

    if (!subscribers) {
      return;
    }

    const payload = this.deserialize(message);

    for (const [, cb] of subscribers) {
      cb(payload);
    }
  };

  async publish(topic: any, data: any): Promise<void> {
    await this.ensureInitialized();

    if (!this.pubClient) {
      throw new Error('Redis publish client is not initialized');
    }

    await this.pubClient.publish(topic, JSON.stringify(data));
  }

  subscribe(topic: any): FreebleObservable<any> {
    const id = uuid();
    let active = true;

    const observable = new Observable((observer) => {
      const register = async () => {
        try {
          await this.ensureInitialized();

          if (!active) {
            return;
          }

          if (!this.subClient) {
            throw new Error('Redis subscribe client is not initialized');
          }

          let topicSubscribers = this.topics.get(topic);
          if (!topicSubscribers) {
            topicSubscribers = new Map();
            this.topics.set(topic, topicSubscribers);
            await this.subClient.subscribe(topic);
          }

          if (!active) {
            this.cleanupTopic(topic, topicSubscribers);
            return;
          }

          const listener: TopicCallback = (data: unknown) => {
            observer.next(data);
          };

          topicSubscribers.set(id, listener);
        } catch (error) {
          observer.error(error);
        }
      };

      register();

      return () => {
        active = false;
        this.detachListener(topic, id);
      };
    }) as FreebleObservable<any>;

    observable.unsubscribe = () => {
      active = false;
      this.detachListener(topic, id);
    };

    return observable;
  }

  private detachListener(topic: string, id: string): void {
    const subscribers = this.topics.get(topic);

    if (!subscribers) {
      return;
    }

    subscribers.delete(id);
    this.cleanupTopic(topic, subscribers);
  }

  private cleanupTopic(
    topic: string,
    subscribers: Map<string, TopicCallback>,
  ): void {
    if (subscribers.size > 0) {
      return;
    }

    this.topics.delete(topic);

    if (!this.subClient) {
      return;
    }

    void this.subClient.unsubscribe(topic).catch(() => undefined);
  }

  private deserialize(data: Buffer | string): unknown {
    let result;

    try {
      result = JSON.parse(data.toString());
    } catch (e) {
      result = v8.deserialize(Buffer.from(data));
    }

    return result;
  }
}
