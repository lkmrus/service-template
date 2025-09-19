import { Review } from '../entities/review.entity';

export const REVIEW_REPOSITORY = Symbol('REVIEW_REPOSITORY');

export interface CreateReviewRecord {
  productId: string;
  userId: string;
  review: string;
  orderId?: string;
  rate: number;
  lang: string;
  date: Date;
}

export interface UpdateReviewRecord {
  productId?: string;
  userId?: string;
  review?: string;
  orderId?: string | null;
  rate?: number;
  lang?: string;
  date?: Date;
}

export interface ReviewRepository {
  list(): Promise<Review[]>;
  listByProduct(productId: string): Promise<Review[]>;
  findById(id: string): Promise<Review | undefined>;
  create(data: CreateReviewRecord): Promise<Review>;
  update(id: string, data: UpdateReviewRecord): Promise<Review>;
  delete(id: string): Promise<Review>;
}
