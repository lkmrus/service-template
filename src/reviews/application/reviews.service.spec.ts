import { NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewRepository } from '../domain/repositories/review.repository';
import { Review } from '../domain/entities/review.entity';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let repository: jest.Mocked<ReviewRepository>;

  const buildReview = (overrides: Partial<Review> = {}): Review => ({
    id: overrides.id ?? 'review-id',
    productId: overrides.productId ?? 'product-id',
    userId: overrides.userId ?? 'user-id',
    review: overrides.review ?? 'Great product!',
    orderId: overrides.orderId,
    rate: overrides.rate ?? 5,
    lang: overrides.lang ?? 'en',
    date: overrides.date ?? new Date('2024-01-01T00:00:00Z'),
    createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00Z'),
    updatedAt: overrides.updatedAt ?? new Date('2024-01-01T00:00:00Z'),
  });

  beforeEach(() => {
    repository = {
      list: jest.fn(),
      listByProduct: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ReviewRepository>;

    service = new ReviewsService(repository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates a review with default date when not provided', async () => {
    repository.create.mockImplementation(async (data) =>
      buildReview({
        id: 'new-review',
        productId: data.productId,
        userId: data.userId,
        review: data.review,
        orderId: data.orderId ?? undefined,
        rate: data.rate,
        lang: data.lang,
        date: data.date,
      }),
    );

    const result = await service.createReview({
      productId: 'product-1',
      userId: 'user-1',
      review: 'Solid',
      rate: 4,
      lang: 'en',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'product-1',
        userId: 'user-1',
        review: 'Solid',
        orderId: undefined,
        rate: 4,
        lang: 'en',
        date: expect.any(Date),
      }),
    );
    expect(result.id).toBe('new-review');
  });

  it('throws when a review is not found', async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(service.getReviewById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates a review and normalizes nullable orderId', async () => {
    const existing = buildReview({ id: 'review-1', orderId: 'order-1' });
    repository.findById.mockResolvedValue(existing);
    repository.update.mockImplementation(async (id, data) =>
      buildReview({
        id,
        orderId: data.orderId ?? undefined,
        rate: data.rate ?? existing.rate,
      }),
    );

    const result = await service.updateReview('review-1', {
      orderId: null,
      rate: 3,
    });

    expect(repository.update).toHaveBeenCalledWith('review-1', {
      productId: undefined,
      userId: undefined,
      review: undefined,
      orderId: null,
      rate: 3,
      lang: undefined,
      date: undefined,
    });
    expect(result.rate).toBe(3);
    expect(result.orderId).toBeUndefined();
  });

  it('deletes a review after verifying it exists', async () => {
    const existing = buildReview({ id: 'review-1' });
    repository.findById.mockResolvedValue(existing);
    repository.delete.mockResolvedValue(existing);

    const result = await service.deleteReview('review-1');

    expect(repository.delete).toHaveBeenCalledWith('review-1');
    expect(result.id).toBe('review-1');
  });
});
