import {
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateCartLineItemDto {
  @IsOptional()
  @IsUUID()
  preOrderId?: string;

  @IsOptional()
  @IsUUID()
  externalUuid?: string;

  @IsOptional()
  @IsObject()
  productSelectionParams?: Record<string, unknown>;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  @Max(1_000_000)
  priceUSD?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
