import { IsOptional, IsUUID } from 'class-validator';

export class CreateCartDto {
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;
}
