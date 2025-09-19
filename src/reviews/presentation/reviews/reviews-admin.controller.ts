import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from '../../application/reviews.service';
import { Review } from '../../domain/entities/review.entity';
import { SuperAdminGuard } from '../../../super-admin/super-admin.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('admin/reviews')
export class ReviewsAdminController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  createReview(@Body() dto: CreateReviewDto): Promise<Review> {
    return this.reviewsService.createReview({
      productId: dto.productId,
      userId: dto.userId,
      review: dto.review,
      orderId: dto.orderId,
      rate: dto.rate,
      lang: dto.lang,
      date: dto.date ? new Date(dto.date) : undefined,
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  updateReview(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.updateReview(id, {
      productId: dto.productId,
      userId: dto.userId,
      review: dto.review,
      orderId: dto.orderId === undefined ? undefined : dto.orderId,
      rate: dto.rate,
      lang: dto.lang,
      date: dto.date ? new Date(dto.date) : undefined,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  deleteReview(@Param('id') id: string): Promise<Review> {
    return this.reviewsService.deleteReview(id);
  }
}
