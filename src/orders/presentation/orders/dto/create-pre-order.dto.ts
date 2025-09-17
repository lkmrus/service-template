import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  Max,
  Min,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'CommissionRateConstraint', async: false })
class CommissionRateConstraint implements ValidatorConstraintInterface {
  validate(value?: CommissionRateDto): boolean {
    if (!value) {
      return false;
    }
    return value.percentage !== undefined || value.fraction !== undefined;
  }

  defaultMessage(): string {
    return 'commission rate requires percentage or fraction value';
  }
}

class CommissionRateDto {
  @Min(0)
  @Max(100)
  percentage?: number;

  @Min(0)
  @Max(1)
  fraction?: number;
}

class CommissionDefinitionDto {
  @Min(0)
  fix: number;

  @ValidateNested()
  @Type(() => CommissionRateDto)
  @Validate(CommissionRateConstraint)
  commissionRate: CommissionRateDto;
}

export class CreatePreOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => CommissionDefinitionDto)
  commissions: Record<string, CommissionDefinitionDto>;
}

export { CommissionDefinitionDto, CommissionRateDto };
