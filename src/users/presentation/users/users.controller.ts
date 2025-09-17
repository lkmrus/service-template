import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../../application/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { SuperAdminOnlyGuard } from './guards/super-admin-only.guard';
import { User } from '../../domain/entities/user.entity';

type UserResponse = Pick<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>;

const toUserResponse = (user: User): UserResponse => ({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    const user = await this.usersService.create(
      createUserDto.email,
      createUserDto.password,
    );
    return toUserResponse(user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), SuperAdminOnlyGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.usersService.update(id, updateUserDto);
    return toUserResponse(user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), SuperAdminOnlyGuard)
  async remove(@Param('id') id: string): Promise<UserResponse> {
    const user = await this.usersService.remove(id);
    return toUserResponse(user);
  }
}
