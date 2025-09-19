import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CreateCartLineItemDto } from './dto/create-cart-line-item.dto';
const cartLineItemsArgs = {
  where: { deletedAt: null },
  orderBy: [{ createdAt: 'asc' } as const],
} satisfies Prisma.CartLineItemFindManyArgs;

const cartInclude = {
  lineItems: cartLineItemsArgs,
} satisfies Prisma.CartInclude;

type CartWithRelations = Prisma.CartGetPayload<{
  include: typeof cartInclude;
}>;

type CartLineItemEntity = CartWithRelations['lineItems'][number];

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapCart(cart: CartWithRelations) {
    return {
      id: cart.id,
      ownerId: cart.ownerId,
      authorId: cart.authorId,
      couponCode: cart.couponCode,
      metadata: (cart.metadata ?? undefined) as unknown,
      mergedToCartId: cart.mergedToCartId,
      deletedAt: cart.deletedAt,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      lineItems: cart.lineItems.map((item) => this.mapLineItem(item)),
    };
  }

  private mapLineItem(item: CartLineItemEntity) {
    return {
      id: item.id,
      cartId: item.cartId,
      preOrderId: item.preOrderId,
      externalUuid: item.externalUuid,
      productSelectionParams: (item.productSelectionParams ??
        undefined) as unknown,
      priceUSD: item.priceUSD ? Number(item.priceUSD) : null,
      metadata: (item.metadata ?? undefined) as unknown,
      deletedAt: item.deletedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async createCart(dto: CreateCartDto) {
    const cart = await this.prisma.cart.create({
      data: {
        ownerId: dto.ownerId ?? null,
        authorId: dto.authorId ?? null,
      },
      include: cartInclude,
    });

    return this.mapCart(cart);
  }

  async getCartById(id: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: cartInclude,
    });

    if (!cart) {
      throw new NotFoundException(`Cart ${id} not found`);
    }

    return this.mapCart(cart);
  }

  async findCartById(id: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: cartInclude,
    });
    return cart ? this.mapCart(cart) : null;
  }

  async getCartByOwner(ownerId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { ownerId, deletedAt: null },
      include: cartInclude,
      orderBy: { createdAt: 'desc' },
    });

    if (!cart) {
      throw new NotFoundException(`Cart for owner ${ownerId} not found`);
    }

    return this.mapCart(cart);
  }

  async findCartByOwner(ownerId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { ownerId, deletedAt: null },
      include: cartInclude,
      orderBy: { createdAt: 'desc' },
    });
    return cart ? this.mapCart(cart) : null;
  }

  async listCarts(): Promise<ReturnType<typeof this.mapCart>[]> {
    const carts = await this.prisma.cart.findMany({
      where: { deletedAt: null },
      include: cartInclude,
      orderBy: { createdAt: 'desc' },
    });

    return carts.map((cart) => this.mapCart(cart));
  }

  async ensureCartForOwner(ownerId: string) {
    const existing = await this.findCartByOwner(ownerId);
    if (existing) {
      return existing;
    }
    return this.createCart({ ownerId });
  }

  countItems(cart: { lineItems?: unknown[] }) {
    return cart?.lineItems?.length ?? 0;
  }

  async updateCart(id: string, dto: UpdateCartDto) {
    const cart = await this.prisma.cart.update({
      where: { id },
      data: {
        ownerId: dto.ownerId ?? null,
        authorId: dto.authorId ?? null,
        couponCode: dto.couponCode ?? null,
      },
      include: cartInclude,
    });

    return this.mapCart(cart);
  }

  async deleteCart(id: string) {
    await this.prisma.cart.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addLineItem(cartId: string, dto: CreateCartLineItemDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId, deletedAt: null },
    });

    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    const prismaDecimal =
      typeof dto.priceUSD === 'number'
        ? new Prisma.Decimal(dto.priceUSD)
        : null;

    const lineItem = await this.prisma.cartLineItem.create({
      data: {
        cartId,
        preOrderId: dto.preOrderId ?? null,
        externalUuid: dto.externalUuid ?? null,
        productSelectionParams:
          dto.productSelectionParams === undefined
            ? undefined
            : (dto.productSelectionParams as Prisma.InputJsonValue),
        priceUSD: prismaDecimal,
        metadata:
          dto.metadata === undefined
            ? undefined
            : (dto.metadata as Prisma.InputJsonValue),
      },
    });

    return {
      id: lineItem.id,
      cartId: lineItem.cartId,
      preOrderId: lineItem.preOrderId,
      externalUuid: lineItem.externalUuid,
      productSelectionParams: (lineItem.productSelectionParams ??
        undefined) as unknown,
      priceUSD: lineItem.priceUSD ? Number(lineItem.priceUSD) : null,
      metadata: (lineItem.metadata ?? undefined) as unknown,
      createdAt: lineItem.createdAt,
      updatedAt: lineItem.updatedAt,
    };
  }

  async removeLineItem(cartId: string, lineItemId: string) {
    const lineItem = await this.prisma.cartLineItem.findUnique({
      where: { id: lineItemId, deletedAt: null },
    });

    if (!lineItem || lineItem.cartId !== cartId) {
      throw new NotFoundException(`Line item ${lineItemId} not found in cart`);
    }

    await this.prisma.cartLineItem.update({
      where: { id: lineItemId },
      data: { deletedAt: new Date() },
    });
  }
}
