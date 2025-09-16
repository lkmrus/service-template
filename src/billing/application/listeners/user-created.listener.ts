import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserCreatedListener {
  @OnEvent('user.created')
  handleUserCreatedEvent(payload: any) {
    // will be implemented later
    console.log('User created event received:', payload);
  }
}
