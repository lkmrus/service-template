import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { LineItemCode } from '../enums/line-item-code.enum';

export class CreateCartLineItemDto {
  @IsEnum(LineItemCode)
  typeCode: LineItemCode;

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
