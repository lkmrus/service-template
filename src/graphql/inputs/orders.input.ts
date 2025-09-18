import { Field, Float, InputType, Int } from '@nestjs/graphql';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CommissionRateInput {
  @Field({ nullable: true })
  @Min(0)
  @Max(100)
  percentage?: number;

  @Field({ nullable: true })
  @Min(0)
  @Max(1)
  fraction?: number;
}

@InputType()
export class CommissionDefinitionInput {
  @Field(() => Float)
  @Min(0)
  fix: number;

  @Field(() => CommissionRateInput)
  @ValidateNested()
  @Type(() => CommissionRateInput)
  commissionRate: CommissionRateInput;
}

@InputType()
export class CommissionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  currency: string;

  @Field(() => CommissionDefinitionInput)
  @ValidateNested()
  @Type(() => CommissionDefinitionInput)
  definition: CommissionDefinitionInput;
}

@InputType()
export class CreatePreOrderInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @Field(() => Int)
  @Min(1)
  quantity: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  currency: string;

  @Field(() => [CommissionInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CommissionInput)
  commissions: CommissionInput[];
}
