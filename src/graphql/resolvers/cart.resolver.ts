import {
  Args,
  Context,
  Int,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { CartModel } from '../models/cart.model';
import { CartLineItemModel } from '../models/cart-line-item.model';
import {
  AddCartLineItemInput,
  CartFilterInput,
  RemoveCartLineItemInput,
} from '../inputs/cart.input';
import { CartsService } from '../../carts/carts.service';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { GraphqlContext } from '../graphql.interface';
import { LineItemCode } from '../../carts/enums/line-item-code.enum';

@Resolver(() => CartModel)
export class CartResolver {
  constructor(private readonly cartsService: CartsService) {}

  private resolveUserId(context: GraphqlContext): string | undefined {
    const req = context.req as { user?: { id?: string } } | undefined;
    return req?.user?.id;
  }

  private async resolveCart(
    filter: CartFilterInput | undefined,
    userId?: string,
  ): Promise<CartModel | null> {
    if (filter?.cartId) {
      return this.cartsService.findCartById(filter.cartId);
    }

    const ownerId = filter?.ownerId ?? userId;
    if (ownerId) {
      return this.cartsService.findCartByOwner(ownerId);
    }

    return null;
  }

  private ensureCartIdentifier(
    input: { cartId?: string; ownerId?: string },
    userId?: string,
  ) {
    if (input.cartId) {
      return { cartId: input.cartId };
    }

    const ownerId = input.ownerId ?? userId;
    if (!ownerId) {
      throw new BadRequestException('ownerId is required');
    }

    return { ownerId };
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => CartModel, { nullable: true })
  async cart(
    @Args('filter', { type: () => CartFilterInput, nullable: true })
    filter: CartFilterInput | undefined,
    @Context() context: GraphqlContext,
  ): Promise<CartModel | null> {
    const userId = this.resolveUserId(context);
    return this.resolveCart(filter, userId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Int)
  async cartItemsCount(
    @Args('filter', { type: () => CartFilterInput, nullable: true })
    filter: CartFilterInput | undefined,
    @Context() context: GraphqlContext,
  ): Promise<number> {
    const userId = this.resolveUserId(context);
    const cart = await this.resolveCart(filter, userId);
    return cart ? this.cartsService.countItems(cart) : 0;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CartLineItemModel)
  async addCartLineItem(
    @Args('input') input: AddCartLineItemInput,
    @Context() context: GraphqlContext,
  ): Promise<CartLineItemModel> {
    const userId = this.resolveUserId(context);
    const { cartId, ownerId } = this.ensureCartIdentifier(input, userId);

    let cart = cartId
      ? await this.cartsService.findCartById(cartId)
      : await this.cartsService.findCartByOwner(ownerId!);

    if (!cart && ownerId) {
      cart = await this.cartsService.ensureCartForOwner(ownerId);
    }

    if (!cart) {
      throw new BadRequestException('Cart not found');
    }

    if (ownerId && cart.ownerId !== ownerId) {
      throw new BadRequestException('Cart does not belong to the specified owner');
    }

    if (!input.productId && !input.product) {
      throw new BadRequestException('productId or product snapshot is required');
    }

    const priceUSD = input.priceUSD ?? input.product?.priceUSD ?? null;
    if (priceUSD === null) {
      throw new BadRequestException('priceUSD is required');
    }

    const productSelectionParamsBase = {
      ...input.productSelectionParams,
    } as Record<string, unknown>;

    if (input.productId || input.product?.id) {
      productSelectionParamsBase.productId = input.productId ?? input.product?.id;
    }

    const productSelectionParams = Object.keys(productSelectionParamsBase).length
      ? productSelectionParamsBase
      : undefined;

    const metadata = input.metadata ?? input.product?.metadata ?? undefined;

    return this.cartsService.addLineItem(cart.id, {
      typeCode: input.typeCode ?? LineItemCode.REGULAR_ITEM,
      preOrderId: input.preOrderId,
      externalUuid: input.externalUuid,
      priceUSD,
      productSelectionParams,
      metadata,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async removeCartLineItem(
    @Args('input') input: RemoveCartLineItemInput,
    @Context() context: GraphqlContext,
  ): Promise<boolean> {
    const userId = this.resolveUserId(context);
    const { cartId, ownerId } = this.ensureCartIdentifier(input, userId);

    const cart = cartId
      ? await this.cartsService.findCartById(cartId)
      : await this.cartsService.findCartByOwner(ownerId!);

    if (!cart) {
      throw new BadRequestException('Cart not found');
    }

    await this.cartsService.removeLineItem(cart.id, input.lineItemId);
    return true;
  }
}
