import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  review?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  orderId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rate?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lang?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
