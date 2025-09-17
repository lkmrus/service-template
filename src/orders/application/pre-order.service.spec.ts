import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PreOrderService } from './pre-order.service';
import { PreOrder } from '../domain/entities/pre-order.entity';
import {
  CreatePreOrderRecord,
  PreOrderRepository,
} from '../domain/repositories/pre-order.repository';
import {
  CalculatedCommission,
  CommissionMatrix,
} from '../domain/types/commission.types';
import { randomUUID } from 'crypto';
import { CreatePreOrderDto } from '../presentation/orders/dto/create-pre-order.dto';

class InMemoryPreOrderRepository implements PreOrderRepository {
  private readonly store = new Map<string, PreOrder>();

  async create(data: CreatePreOrderRecord): Promise<PreOrder> {
    const preOrder = this.materialize({
      id: data.id ?? randomUUID(),
      userId: data.userId,
      sellerId: data.sellerId,
      productId: data.productId,
      quantity: data.quantity,
      totalPrice: data.totalPrice ?? 0,
      currency: data.currency,
      commissions: data.commissions,
      calculatedCommissions: data.calculatedCommissions ?? undefined,
    });
    this.store.set(preOrder.id, preOrder);
    return preOrder;
  }

  async findById(id: string): Promise<PreOrder | undefined> {
    return this.store.get(id);
  }

  async save(preOrder: PreOrder): Promise<PreOrder> {
    this.store.set(preOrder.id, preOrder);
    return preOrder;
  }

  private materialize(data: {
    id: string;
    userId: string;
    sellerId: string;
    productId: string;
    quantity: number;
    totalPrice: number;
    currency: string;
    commissions: CommissionMatrix;
    calculatedCommissions?: CalculatedCommission | undefined;
  }): PreOrder {
    const preOrder = new PreOrder();
    preOrder.id = data.id;
    preOrder.userId = data.userId;
    preOrder.sellerId = data.sellerId;
    preOrder.productId = data.productId;
    preOrder.quantity = data.quantity;
    preOrder.totalPrice = data.totalPrice;
    preOrder.currency = data.currency;
    preOrder.commissions = data.commissions as any;
    preOrder.calculatedCommissions = data.calculatedCommissions as any;
    preOrder.createdAt = new Date();
    preOrder.updatedAt = new Date();
    return preOrder;
  }
}

const createPayload = (currency: 'USD' | 'EUR'): CreatePreOrderDto => ({
  userId: 'user-1',
  sellerId: 'seller-1',
  productId: 'product-1',
  quantity: 2,
  currency,
  commissions: {
    USD: {
      fix: 5,
      commissionRate: {
        percentage: 5,
      },
    },
    EUR: {
      fix: 5,
      commissionRate: {
        fraction: 0.05,
      },
    },
  },
});

describe('PreOrderService', () => {
  let service: PreOrderService;
  let repository: InMemoryPreOrderRepository;

  beforeEach(() => {
    repository = new InMemoryPreOrderRepository();
    service = new PreOrderService(repository as unknown as PreOrderRepository);
  });

  it('creates and calculates commissions using percentage input', async () => {
    const payload = createPayload('USD');

    const result = await service.createPreOrder(payload);

    expect(result.calculatedCommissions?.percentageAmount).toBe(10);
    expect(result.calculatedCommissions?.total).toBe(15);
    expect(result.totalPrice).toBe(215);
  });

  it('calculates commissions using fraction input', async () => {
    const payload = createPayload('EUR');
    const preOrder = await service.createPreOrder(payload);

    expect(preOrder.calculatedCommissions?.percentageAmount).toBe(10);
    expect(preOrder.calculatedCommissions?.total).toBe(15);
    expect(preOrder.totalPrice).toBe(215);
  });

  it('throws when commission rate is missing', async () => {
    const payload = createPayload('USD');
    (payload.commissions.USD as any).commissionRate = {};

    await expect(service.createPreOrder(payload)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws when percentage is out of range', async () => {
    const payload = createPayload('USD');
    (payload.commissions.USD as any).commissionRate = { percentage: 150 };

    await expect(service.createPreOrder(payload)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws when fraction is out of range', async () => {
    const payload = createPayload('EUR');
    (payload.commissions.EUR as any).commissionRate = { fraction: 1.5 };

    await expect(service.createPreOrder(payload)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('finds a stored pre-order', async () => {
    const payload = createPayload('USD');
    const created = await service.createPreOrder(payload);

    const lookup = await service.findById(created.id);

    expect(lookup.id).toBe(created.id);
  });

  it('throws when pre-order not found', async () => {
    await expect(service.findById('missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
