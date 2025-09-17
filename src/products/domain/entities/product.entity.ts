import { ProductPrices } from '../types/product-prices.type';

export class Product {
  id: string;
  title: string;
  slug: string;
  sku?: string;
  description?: string;
  properties: Record<string, any>;
  prices: ProductPrices;
  quantity: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
