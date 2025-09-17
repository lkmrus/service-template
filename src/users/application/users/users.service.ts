import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../../presentation/users/dto/update-user.dto';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async findOne(email: string): Promise<User | undefined> {
    return this.userRepository.findByEmail(email);
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.userRepository.findById(id);
  }

  async create(email: string, pass: string): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException(`User with email ${email} already exists`);
    }
    const password = await bcrypt.hash(pass, 10);
    return this.userRepository.create({ email, password });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    user.updatedAt = new Date();
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<User> {
    const removedUser = await this.userRepository.remove(id);
    if (!removedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return removedUser;
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const isCurrentValid = await bcrypt.compare(
      currentPassword,
      user.password ?? '',
    );

    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();

    return this.userRepository.save(user);
  }
}
