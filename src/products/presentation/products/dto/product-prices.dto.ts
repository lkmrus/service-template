import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class ProductPricesDto {
  [currency: string]: number;
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  USD: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  EUR: number;
}
