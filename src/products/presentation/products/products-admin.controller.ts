import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from '../../application/products.service';
import { Product } from '../../domain/entities/product.entity';
import { SuperAdminGuard } from '../../../super-admin/super-admin.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('admin/products')
export class ProductsAdminController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  createProduct(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.createProduct({
      title: dto.title,
      slug: dto.slug,
      sku: dto.sku,
      description: dto.description,
      properties: dto.properties,
      prices: dto.prices,
      quantity: dto.quantity,
      isActive: dto.isActive,
      metadata: dto.metadata,
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.updateProduct(id, {
      title: dto.title,
      slug: dto.slug,
      sku: dto.sku,
      description: dto.description,
      properties: dto.properties,
      prices: dto.prices,
      quantity: dto.quantity,
      isActive: dto.isActive,
      metadata: dto.metadata,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  deleteProduct(@Param('id') id: string): Promise<Product> {
    return this.productsService.deleteProduct(id);
  }
}
