import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { UsersService } from '../../users/application/users/users.service';
import { UserModel } from '../models/user.model';
import {
  ChangePasswordInput,
  RegisterUserInput,
  UpdateUserInput,
} from '../inputs/user.input';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { SuperAdminOnlyGuard } from '../../users/presentation/users/guards/super-admin-only.guard';
import { User } from '../../users/domain/entities/user.entity';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => UserModel)
  async registerUser(
    @Args('input') input: RegisterUserInput,
  ): Promise<UserModel> {
    const user = await this.usersService.create(input.email, input.password);
    return this.toGraphqlModel(user);
  }

  @Mutation(() => UserModel)
  @UseGuards(GqlAuthGuard, SuperAdminOnlyGuard)
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserModel> {
    const user = await this.usersService.update(id, input);
    return this.toGraphqlModel(user);
  }

  @Mutation(() => UserModel)
  @UseGuards(GqlAuthGuard, SuperAdminOnlyGuard)
  async deleteUser(@Args('id') id: string): Promise<UserModel> {
    const user = await this.usersService.remove(id);
    return this.toGraphqlModel(user);
  }

  @Mutation(() => UserModel)
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @Args('id') id: string,
    @Args('input') input: ChangePasswordInput,
    @Context('req') req: { user?: User },
  ): Promise<UserModel> {
    const requester = req.user;
    if (!requester || requester.id !== id) {
      throw new ForbiddenException('You can only change your own password');
    }

    const user = await this.usersService.changePassword(
      id,
      input.currentPassword,
      input.newPassword,
    );

    return this.toGraphqlModel(user);
  }

  private toGraphqlModel(user: User): UserModel {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
