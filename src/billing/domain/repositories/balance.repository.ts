import { Balance } from '../entities/balance.entity';

export const BALANCE_REPOSITORY = Symbol('BALANCE_REPOSITORY');

export interface BalanceRepository {
  findByUserId(userId: string): Promise<Balance | undefined>;
  upsert(
    userId: string,
    amountInDelta: number,
    amountOutDelta: number,
  ): Promise<Balance>;
}
