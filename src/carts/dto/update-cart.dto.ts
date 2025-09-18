import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCartDto {
  @IsOptional()
  @IsUUID()
  ownerId?: string | null;

  @IsOptional()
  @IsUUID()
  authorId?: string | null;

  @IsOptional()
  @IsString()
  couponCode?: string | null;
}
