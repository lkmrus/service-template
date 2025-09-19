import { Controller, Get, Param } from '@nestjs/common';
import { ReviewsService } from '../../application/reviews.service';
import { Review } from '../../domain/entities/review.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  listReviews(): Promise<Review[]> {
    return this.reviewsService.listReviews();
  }

  @Get('product/:productId')
  listReviewsByProduct(
    @Param('productId') productId: string,
  ): Promise<Review[]> {
    return this.reviewsService.listReviewsByProduct(productId);
  }

  @Get(':id')
  getReview(@Param('id') id: string): Promise<Review> {
    return this.reviewsService.getReviewById(id);
  }
}
