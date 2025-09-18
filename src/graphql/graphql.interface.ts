import { IncomingMessage, ServerResponse } from 'http';
import WebSocket from 'ws';

export type DataSourceInstances = Record<string, unknown>;

export interface GraphqlContext {
  extra?: { request: IncomingMessage; socket: WebSocket };
  req?: IncomingMessage;
  res?: ServerResponse;
  connection?: WebSocket;
  dataloaders: WeakMap<object, unknown>;
  dataSources: DataSourceInstances;
}
