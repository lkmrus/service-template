import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductRepository } from '../domain/repositories/product.repository';
import { Product } from '../domain/entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<ProductRepository>;

  const buildProduct = (overrides: Partial<Product> = {}): Product => ({
    id: overrides.id ?? 'product-id',
    title: overrides.title ?? 'title',
    slug: overrides.slug ?? 'title',
    properties: overrides.properties ?? {},
    prices: overrides.prices ?? { USD: 10, EUR: 9 },
    quantity: overrides.quantity ?? 1,
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
    sku: overrides.sku,
    description: overrides.description,
    metadata: overrides.metadata,
  });

  beforeEach(() => {
    repository = {
      list: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findBySku: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ProductRepository>;
    service = new ProductsService(repository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create a product with a unique slug and defaults', async () => {
    repository.findBySlug
      .mockResolvedValueOnce(
        buildProduct({ id: 'other', slug: 'sample-product' }),
      )
      .mockResolvedValueOnce(undefined);
    repository.findBySku.mockResolvedValue(undefined);
    repository.create.mockImplementation(async (data) =>
      buildProduct({
        id: 'new-id',
        title: data.title,
        slug: data.slug,
        sku: data.sku,
        description: data.description,
        properties: data.properties,
        prices: data.prices,
        quantity: data.quantity,
        isActive: data.isActive,
        metadata: data.metadata,
      }),
    );

    const result = await service.createProduct({
      title: 'Sample Product',
      properties: { color: 'red' },
      prices: { USD: 10, EUR: 9 },
    });

    expect(result.slug).toBe('sample-product-2');
    expect(repository.create).toHaveBeenCalledWith({
      title: 'Sample Product',
      slug: 'sample-product-2',
      sku: undefined,
      description: undefined,
      properties: { color: 'red' },
      prices: { USD: 10, EUR: 9 },
      quantity: 0,
      isActive: true,
      metadata: undefined,
    });
  });

  it('should throw when product not found by id', async () => {
    repository.findById.mockResolvedValue(undefined);
    await expect(service.getProductById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should update product and refresh slug when title changes', async () => {
    const existing = buildProduct({
      id: 'prod-1',
      slug: 'old-title',
      title: 'Old Title',
    });
    repository.findById.mockResolvedValue(existing);
    repository.findBySlug
      .mockResolvedValueOnce(buildProduct({ id: 'other', slug: 'new-title' }))
      .mockResolvedValueOnce(undefined);
    repository.findBySku.mockResolvedValue(undefined);
    repository.update.mockImplementation(async (id, data) =>
      buildProduct({
        id,
        slug: data.slug ?? existing.slug,
        title: data.title ?? existing.title,
      }),
    );

    const result = await service.updateProduct('prod-1', {
      title: 'New Title',
      prices: { USD: 12, EUR: 11 },
    });

    expect(repository.update).toHaveBeenCalledWith('prod-1', {
      title: 'New Title',
      slug: 'new-title-2',
      sku: undefined,
      description: undefined,
      properties: undefined,
      prices: { USD: 12, EUR: 11 },
      quantity: undefined,
      isActive: undefined,
      metadata: undefined,
    });
    expect(result.slug).toBe('new-title-2');
  });

  it('should delete a product after verifying it exists', async () => {
    const existing = buildProduct({ id: 'prod-1' });
    repository.findById.mockResolvedValue(existing);
    repository.delete.mockResolvedValue(existing);

    const result = await service.deleteProduct('prod-1');

    expect(repository.delete).toHaveBeenCalledWith('prod-1');
    expect(result.id).toBe('prod-1');
  });
});
