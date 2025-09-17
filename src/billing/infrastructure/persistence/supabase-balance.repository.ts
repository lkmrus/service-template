import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { handleSupabaseError, quoted } from '../../../supabase/supabase.utils';
import { Balance } from '../../domain/entities/balance.entity';
import { BalanceRepository } from '../../domain/repositories/balance.repository';

const TABLE = quoted('Balance');

const mapToDomain = (record: any): Balance | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Balance();
  entity.userId = record.userId;
  entity.amountIn = record.amountIn;
  entity.amountOut = record.amountOut;
  return entity;
};

@Injectable()
export class SupabaseBalanceRepository implements BalanceRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findByUserId(userId: string): Promise<Balance | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('userId', userId)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async upsert(
    userId: string,
    amountInDelta: number,
    amountOutDelta: number,
  ): Promise<Balance> {
    const client = this.supabase.getClient();

    const { data: existing, error: findError } = await client
      .from(TABLE)
      .select('*')
      .eq('userId', userId)
      .maybeSingle();
    handleSupabaseError(findError);

    if (!existing) {
      const { data, error } = await client
        .from(TABLE)
        .insert({
          userId,
          amountIn: amountInDelta,
          amountOut: amountOutDelta,
        })
        .select()
        .single();
      handleSupabaseError(error);
      return mapToDomain(data)!;
    }

    const { data, error } = await client
      .from(TABLE)
      .update({
        amountIn: existing.amountIn + amountInDelta,
        amountOut: existing.amountOut + amountOutDelta,
      })
      .eq('userId', userId)
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(data)!;
  }
}
