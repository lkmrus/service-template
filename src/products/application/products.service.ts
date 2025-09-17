import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../domain/repositories/product.repository';
import { ProductRepository } from '../domain/repositories/product.repository';
import { Product } from '../domain/entities/product.entity';
import { ProductPrices } from '../domain/types/product-prices.type';

export interface CreateProductInput {
  title: string;
  slug?: string;
  sku?: string;
  description?: string;
  properties: Record<string, any>;
  prices: ProductPrices;
  quantity?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateProductInput {
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

const SLUG_FALLBACK = 'product';

const normalizeSlug = (value: string): string => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return slug.length > 0 ? slug : SLUG_FALLBACK;
};

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
  ) {}

  async listProducts(): Promise<Product[]> {
    return this.repository.list();
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const normalized = normalizeSlug(slug);
    const product = await this.repository.findBySlug(normalized);
    if (!product) {
      throw new NotFoundException(`Product with slug ${normalized} not found`);
    }
    return product;
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    const baseSlug = normalizeSlug(input.slug ?? input.title);
    const slug = await this.ensureUniqueSlug(baseSlug);

    await this.ensureSkuAvailable(input.sku);

    return this.repository.create({
      title: input.title,
      slug,
      sku: input.sku,
      description: input.description,
      properties: input.properties,
      prices: input.prices,
      quantity: input.quantity ?? 0,
      isActive: input.isActive ?? true,
      metadata: input.metadata,
    });
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    const existing = await this.getProductById(id);

    let slugToPersist: string | undefined;
    if (input.slug !== undefined) {
      const candidate = normalizeSlug(input.slug);
      if (candidate !== existing.slug) {
        slugToPersist = await this.ensureUniqueSlug(candidate, id);
      }
    } else if (input.title) {
      const candidate = normalizeSlug(input.title);
      if (candidate !== existing.slug) {
        slugToPersist = await this.ensureUniqueSlug(candidate, id);
      }
    }

    if (input.sku !== undefined && input.sku !== existing.sku) {
      await this.ensureSkuAvailable(input.sku, id);
    }

    return this.repository.update(id, {
      title: input.title,
      slug: slugToPersist,
      sku: input.sku,
      description: input.description,
      properties: input.properties,
      prices: input.prices,
      quantity: input.quantity,
      isActive: input.isActive,
      metadata: input.metadata,
    });
  }

  async deleteProduct(id: string): Promise<Product> {
    await this.getProductById(id);
    return this.repository.delete(id);
  }

  private async ensureUniqueSlug(
    desired: string,
    ignoreProductId?: string,
  ): Promise<string> {
    let attempt = desired;
    let suffix = 1;
    // Limit attempts to avoid infinite loops in degenerate cases.
    while (suffix < 1000) {
      const existing = await this.repository.findBySlug(attempt);
      if (!existing || existing.id === ignoreProductId) {
        return attempt;
      }
      suffix += 1;
      attempt = `${desired}-${suffix}`;
    }
    throw new ConflictException('Unable to generate a unique product slug');
  }

  private async ensureSkuAvailable(
    sku?: string,
    ignoreProductId?: string,
  ): Promise<void> {
    if (!sku) {
      return;
    }
    const existing = await this.repository.findBySku(sku);
    if (existing && existing.id !== ignoreProductId) {
      throw new ConflictException(`SKU ${sku} is already in use`);
    }
  }
}
