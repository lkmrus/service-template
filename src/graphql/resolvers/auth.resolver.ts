import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { LoginInput } from '../inputs/auth.input';
import { AuthPayloadModel } from '../models/auth.model';
import { User } from '../../users/domain/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayloadModel)
  async login(@Args('input') input: LoginInput): Promise<AuthPayloadModel> {
    const user = await this.authService.validateUser(
      input.email,
      input.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.authService.login(user as User);

    return {
      accessToken: token.access_token,
    };
  }
}
