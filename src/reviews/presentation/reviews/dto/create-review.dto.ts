import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  review: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rate: number;

  @IsString()
  @IsNotEmpty()
  lang: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
