import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../../application/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { SuperAdminOnlyGuard } from './guards/super-admin-only.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
            update: jest.fn().mockResolvedValue({ id: '1', email: 'updated@example.com' }),
            remove: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(SuperAdminOnlyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const result = await controller.create(createUserDto);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto.email, createUserDto.password);
      expect(result).toEqual({ id: '1', email: 'test@example.com' });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = { email: 'updated@example.com' };
      const result = await controller.update(userId, updateUserDto);
      expect(usersService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual({ id: '1', email: 'updated@example.com' });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = '1';
      const result = await controller.remove(userId);
      expect(usersService.remove).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ id: '1', email: 'test@example.com' });
    });
  });
});
