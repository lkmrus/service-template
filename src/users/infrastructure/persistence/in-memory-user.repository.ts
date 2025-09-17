import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from '../../domain/entities/user.entity';
import {
  CreateUserRecord,
  UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[] = [];

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async create(data: CreateUserRecord): Promise<User> {
    const user = new User();
    user.id = randomUUID();
    user.email = data.email;
    user.password = data.password;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    this.users.push(user);
    return user;
  }

  async save(user: User): Promise<User> {
    const index = this.users.findIndex(
      (existingUser) => existingUser.id === user.id,
    );
    if (index === -1) {
      this.users.push(user);
    } else {
      this.users[index] = user;
    }
    return user;
  }

  async remove(id: string): Promise<User | undefined> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      return undefined;
    }
    const [removed] = this.users.splice(index, 1);
    return removed;
  }

  /**
   * Utility helper used in tests to reset the in-memory state.
   */
  clear(): void {
    this.users.splice(0, this.users.length);
  }
}
