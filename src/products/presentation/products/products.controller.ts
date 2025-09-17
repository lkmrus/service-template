import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from '../../application/products.service';
import { Product } from '../../domain/entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listProducts(): Promise<Product[]> {
    return this.productsService.listProducts();
  }

  @Get('slug/:slug')
  getBySlug(@Param('slug') slug: string): Promise<Product> {
    return this.productsService.getProductBySlug(slug);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<Product> {
    return this.productsService.getProductById(id);
  }
}
