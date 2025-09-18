import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { LineItemCode } from '../enums/line-item-code.enum';

export class CreateCartLineItemDto {
  @IsEnum(LineItemCode)
  typeCode: LineItemCode;

  @IsOptional()
  @IsString()
  orderStubId?: string;

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
  @IsISO8601({ strict: true })
  gracePeriod?: string;

  @IsOptional()
  @IsUUID()
  parentLineItemId?: string;

  @IsOptional()
  @IsUUID()
  parentBundleId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
