import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { quoted, handleSupabaseError } from '../../../supabase/supabase.utils';
import { User } from '../../domain/entities/user.entity';
import {
  CreateUserRecord,
  UserRepository,
} from '../../domain/repositories/user.repository';

const TABLE = quoted('User');

const mapToDomain = (record: any): User | undefined => {
  if (!record) {
    return undefined;
  }
  const user = new User();
  user.id = record.id;
  user.email = record.email;
  user.password = record.password;
  user.createdAt = new Date(record.createdAt);
  user.updatedAt = new Date(record.updatedAt);
  return user;
};

@Injectable()
export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('email', email)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async findById(id: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async create(data: CreateUserRecord): Promise<User> {
    const { data: created, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .insert({
        email: data.email,
        password: data.password,
      })
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(created)!;
  }

  async save(user: User): Promise<User> {
    const { data: updated, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .update({
        email: user.email,
        password: user.password,
        updatedAt: user.updatedAt?.toISOString() ?? new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(updated)!;
  }

  async remove(id: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }
}
