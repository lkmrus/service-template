import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateReviewRecord,
  REVIEW_REPOSITORY,
  ReviewRepository,
  UpdateReviewRecord,
} from '../domain/repositories/review.repository';
import { Review } from '../domain/entities/review.entity';

export interface CreateReviewInput {
  productId: string;
  userId: string;
  review: string;
  orderId?: string;
  rate: number;
  lang: string;
  date?: Date;
}

export interface UpdateReviewInput {
  productId?: string;
  userId?: string;
  review?: string;
  orderId?: string | null;
  rate?: number;
  lang?: string;
  date?: Date;
}

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly repository: ReviewRepository,
  ) {}

  listReviews(): Promise<Review[]> {
    return this.repository.list();
  }

  listReviewsByProduct(productId: string): Promise<Review[]> {
    return this.repository.listByProduct(productId);
  }

  async getReviewById(id: string): Promise<Review> {
    const review = await this.repository.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    return review;
  }

  async createReview(input: CreateReviewInput): Promise<Review> {
    const payload: CreateReviewRecord = {
      productId: input.productId,
      userId: input.userId,
      review: input.review,
      orderId: input.orderId,
      rate: input.rate,
      lang: input.lang,
      date: input.date ?? new Date(),
    };

    return this.repository.create(payload);
  }

  async updateReview(id: string, input: UpdateReviewInput): Promise<Review> {
    await this.getReviewById(id);

    const payload: UpdateReviewRecord = {
      productId: input.productId,
      userId: input.userId,
      review: input.review,
      orderId:
        input.orderId === undefined ? undefined : (input.orderId ?? null),
      rate: input.rate,
      lang: input.lang,
      date: input.date,
    };

    return this.repository.update(id, payload);
  }

  async deleteReview(id: string): Promise<Review> {
    await this.getReviewById(id);
    return this.repository.delete(id);
  }
}
