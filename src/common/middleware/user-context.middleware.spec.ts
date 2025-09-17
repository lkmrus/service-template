import { UserContextMiddleware } from './user-context.middleware';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/application/users/users.service';
import { Request, Response, NextFunction } from 'express';
import { User } from '../../users/domain/entities/user.entity';

describe('UserContextMiddleware', () => {
  let middleware: UserContextMiddleware;
  let jwtService: JwtService;
  let usersService: UsersService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    validatePassword: jest.fn(),
  };

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
    } as any;
    usersService = {
      findOne: jest.fn(),
    } as any;
    middleware = new UserContextMiddleware(jwtService, usersService);

    mockRequest = { cookies: {} };
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next() if no access_token cookie is present', async () => {
    await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.user).toBeUndefined();
  });

  it('should call next() and not set req.user if token is invalid', async () => {
    mockRequest.cookies = { access_token: 'invalid-token' };
    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.user).toBeUndefined();
  });

  it('should call next() and not set req.user if user not found', async () => {
    mockRequest.cookies = { access_token: 'valid-token' };
    jest.spyOn(jwtService, 'verify').mockReturnValue({ email: 'nonexistent@example.com' });
    jest.spyOn(usersService, 'findOne').mockResolvedValue(undefined);

    await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.user).toBeUndefined();
  });

  it('should call next() and set req.user if token is valid and user is found', async () => {
    mockRequest.cookies = { access_token: 'valid-token' };
    jest.spyOn(jwtService, 'verify').mockReturnValue({ email: mockUser.email });
    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

    await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.user).toEqual(mockUser);
  });
});
