import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/application/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/domain/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let mockUserInstance: User;

  beforeEach(async () => {
    mockUserInstance = new User();
    mockUserInstance.id = '1';
    mockUserInstance.email = 'test@example.com';
    mockUserInstance.password = 'hashedPassword';
    mockUserInstance.createdAt = new Date();
    mockUserInstance.updatedAt = new Date();
    mockUserInstance.validatePassword = jest.fn().mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUserInstance),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockedJwtToken'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(undefined);
      const user = await service.validateUser('nonexistent@example.com', 'password');
      expect(user).toBeNull();
    });

    it('should return null if password invalid', async () => {
      jest.spyOn(mockUserInstance, 'validatePassword').mockResolvedValue(false);
      const user = await service.validateUser('test@example.com', 'wrongpassword');
      expect(user).toBeNull();
    });

    it('should return user (without password) if credentials are valid', async () => {
      const { password, ...result } = mockUserInstance;
      const user = await service.validateUser('test@example.com', 'password');
      expect(user).toEqual(result);
      expect(user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('should return an access_token', async () => {
      const result = await service.login(mockUserInstance);
      expect(result).toEqual({ access_token: 'mockedJwtToken' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUserInstance.email,
        sub: mockUserInstance.id,
      });
    });
  });
});
