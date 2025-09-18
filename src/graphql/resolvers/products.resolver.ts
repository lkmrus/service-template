import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductsService } from '../../products/application/products.service';
import { ProductModel } from '../models/product.model';
import { CreateProductInput, UpdateProductInput } from '../inputs/product.input';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { SuperAdminGuard } from '../../super-admin/super-admin.guard';
import { ProductPrices } from '../../products/domain/types/product-prices.type';

@Resolver(() => ProductModel)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => [ProductModel])
  async products(): Promise<ProductModel[]> {
    return this.productsService.listProducts();
  }

  @Query(() => ProductModel)
  async productById(@Args('id') id: string): Promise<ProductModel> {
    return this.productsService.getProductById(id);
  }

  @Query(() => ProductModel)
  async productBySlug(@Args('slug') slug: string): Promise<ProductModel> {
    return this.productsService.getProductBySlug(slug);
  }

  @Mutation(() => ProductModel)
  @UseGuards(GqlAuthGuard, SuperAdminGuard)
  async createProduct(
    @Args('input') input: CreateProductInput,
  ): Promise<ProductModel> {
    return this.productsService.createProduct({
      ...input,
      prices: input.prices as ProductPrices,
    });
  }

  @Mutation(() => ProductModel)
  @UseGuards(GqlAuthGuard, SuperAdminGuard)
  async updateProduct(
    @Args('id') id: string,
    @Args('input') input: UpdateProductInput,
  ): Promise<ProductModel> {
    const prices =
      input.prices !== undefined
        ? (input.prices as ProductPrices)
        : undefined;

    return this.productsService.updateProduct(id, {
      ...input,
      prices,
    });
  }

  @Mutation(() => ProductModel)
  @UseGuards(GqlAuthGuard, SuperAdminGuard)
  async deleteProduct(@Args('id') id: string): Promise<ProductModel> {
    return this.productsService.deleteProduct(id);
  }
}
