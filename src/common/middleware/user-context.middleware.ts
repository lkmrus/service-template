import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/application/users/users.service';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.['access_token'];

    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        const user = await this.usersService.findOne(payload.email);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid or expired
      }
    }

    next();
  }
}
