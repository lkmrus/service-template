import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../../presentation/users/dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  async findOne(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async create(email: string, pass: string): Promise<User> {
    const password = await bcrypt.hash(pass, 10);
    const newUser = new User();
    newUser.id = (this.users.length + 1).toString();
    newUser.email = email;
    newUser.password = password;
    newUser.createdAt = new Date();
    newUser.updatedAt = new Date();
    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const user = this.users[userIndex];
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    user.updatedAt = new Date();
    return user;
  }

  async remove(id: string): Promise<User> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const [removedUser] = this.users.splice(userIndex, 1);
    return removedUser;
  }
}
