import { Product } from '../entities/product.entity';
import { ProductPrices } from '../types/product-prices.type';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface CreateProductRecord {
  title: string;
  slug: string;
  sku?: string;
  description?: string;
  properties: Record<string, any>;
  prices: ProductPrices;
  quantity: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateProductRecord {
  title?: string;
  slug?: string;
  sku?: string;
  description?: string;
  properties?: Record<string, any>;
  prices?: ProductPrices;
  quantity?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface ProductRepository {
  list(): Promise<Product[]>;
  findById(id: string): Promise<Product | undefined>;
  findBySlug(slug: string): Promise<Product | undefined>;
  findBySku(sku: string): Promise<Product | undefined>;
  create(data: CreateProductRecord): Promise<Product>;
  update(id: string, data: UpdateProductRecord): Promise<Product>;
  delete(id: string): Promise<Product>;
}
