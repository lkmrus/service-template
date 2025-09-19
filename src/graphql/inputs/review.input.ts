import { Field, InputType, Int } from '@nestjs/graphql';
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
import { GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class CreateReviewInput {
  @Field()
  @IsUUID()
  productId: string;

  @Field()
  @IsUUID()
  userId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  review: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(5)
  rate: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  lang: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string;
}

@InputType()
export class UpdateReviewInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  review?: string;

  @Field({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  orderId?: string | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lang?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string;
}
