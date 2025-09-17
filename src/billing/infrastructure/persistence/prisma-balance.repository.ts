import { Injectable } from '@nestjs/common';
import { Balance as PrismaBalance } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { Balance } from '../../domain/entities/balance.entity';
import { BalanceRepository } from '../../domain/repositories/balance.repository';

const mapToDomain = (record: PrismaBalance | null): Balance | undefined => {
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
export class PrismaBalanceRepository implements BalanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Balance | undefined> {
    const record = await this.prisma.balance.findUnique({ where: { userId } });
    return mapToDomain(record);
  }

  async upsert(
    userId: string,
    amountInDelta: number,
    amountOutDelta: number,
  ): Promise<Balance> {
    const record = await this.prisma.balance.upsert({
      where: { userId },
      create: {
        userId,
        amountIn: amountInDelta,
        amountOut: amountOutDelta,
      },
      update: {
        amountIn: { increment: amountInDelta },
        amountOut: { increment: amountOutDelta },
      },
    });
    return mapToDomain(record)!;
  }
}
