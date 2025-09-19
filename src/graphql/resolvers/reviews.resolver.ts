import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReviewsService } from '../../reviews/application/reviews.service';
import { ReviewModel } from '../models/review.model';
import { CreateReviewInput, UpdateReviewInput } from '../inputs/review.input';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { SuperAdminGuard } from '../../super-admin/super-admin.guard';

@Resolver(() => ReviewModel)
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Query(() => [ReviewModel])
  async reviews(): Promise<ReviewModel[]> {
    return this.reviewsService.listReviews();
  }

  @Query(() => [ReviewModel])
  async reviewsByProduct(
    @Args('productId') productId: string,
  ): Promise<ReviewModel[]> {
    return this.reviewsService.listReviewsByProduct(productId);
  }

  @Query(() => ReviewModel)
  async reviewById(@Args('id') id: string): Promise<ReviewModel> {
    return this.reviewsService.getReviewById(id);
  }

  @Mutation(() => ReviewModel)
  @UseGuards(GqlAuthGuard, SuperAdminGuard)
  async createReview(
    @Args('input') input: CreateReviewInput,
  ): Promise<ReviewModel> {
    return this.reviewsService.createReview({
      productId: input.productId,
      userId: input.userId,
      review: input.review,
      orderId: input.orderId,
      rate: input.rate,
      lang: input.lang,
      date: input.date ? new Date(input.date) : undefined,
    });
  }

  @Mutation(() => ReviewModel)
  @UseGuards(GqlAuthGuard, SuperAdminGuard)
  async updateReview(
    @Args('id') id: string,
    @Args('input') input: UpdateReviewInput,
  ): Promise<ReviewModel> {
    return this.reviewsService.updateReview(id, {
      productId: input.productId,
      userId: input.userId,
      review: input.review,
      orderId: input.orderId === undefined ? undefined : input.orderId,
      rate: input.rate,
      lang: input.lang,
      date: input.date ? new Date(input.date) : undefined,
    });
  }

  @Mutation(() => ReviewModel)
  @UseGuards(GqlAuthGuard, SuperAdminGuard)
  async deleteReview(@Args('id') id: string): Promise<ReviewModel> {
    return this.reviewsService.deleteReview(id);
  }
}
