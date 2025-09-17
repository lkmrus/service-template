import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import {
  CreateUserRecord,
  UserRepository,
} from '../../domain/repositories/user.repository';

const mapToDomain = (record: PrismaUser | null): User | undefined => {
  if (!record) {
    return undefined;
  }
  const user = new User();
  user.id = record.id;
  user.email = record.email;
  user.password = record.password;
  user.createdAt = record.createdAt;
  user.updatedAt = record.updatedAt;
  return user;
};

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return mapToDomain(user);
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return mapToDomain(user);
  }

  async create(data: CreateUserRecord): Promise<User> {
    const user = await this.prisma.user.create({ data });
    return mapToDomain(user)!;
  }

  async save(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        password: user.password ?? undefined,
        updatedAt: user.updatedAt,
      },
    });
    return mapToDomain(updated)!;
  }

  async remove(id: string): Promise<User | undefined> {
    try {
      const removed = await this.prisma.user.delete({ where: { id } });
      return mapToDomain(removed);
    } catch (error) {
      return undefined;
    }
  }
}
