import { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserRecord {
  email: string;
  password: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: string): Promise<User | undefined>;
  create(data: CreateUserRecord): Promise<User>;
  save(user: User): Promise<User>;
  remove(id: string): Promise<User | undefined>;
}
