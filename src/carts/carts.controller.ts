import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CreateCartLineItemDto } from './dto/create-cart-line-item.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  create(@Body() dto: CreateCartDto) {
    return this.cartsService.createCart(dto);
  }

  @Get()
  find(@Query('ownerId') ownerId?: string) {
    if (ownerId) {
      return this.cartsService.getCartByOwner(ownerId);
    }

    return this.cartsService.listCarts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartsService.getCartById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCartDto) {
    return this.cartsService.updateCart(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartsService.deleteCart(id);
  }

  @Post(':id/line-items')
  addLineItem(@Param('id') cartId: string, @Body() dto: CreateCartLineItemDto) {
    return this.cartsService.addLineItem(cartId, dto);
  }

  @Delete(':id/line-items/:lineItemId')
  removeLineItem(
    @Param('id') cartId: string,
    @Param('lineItemId') lineItemId: string,
  ) {
    return this.cartsService.removeLineItem(cartId, lineItemId);
  }
}
