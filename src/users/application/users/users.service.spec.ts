import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../../presentation/users/dto/update-user.dto';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/repositories/user.repository';
import { InMemoryUserRepository } from '../../infrastructure/persistence/in-memory-user.repository';

jest.mock('bcrypt', () => ({
  hash: jest.fn((password: string) => `hashed_${password}`),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: InMemoryUserRepository;

  beforeEach(async () => {
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get<UserRepository>(
      USER_REPOSITORY,
    ) as InMemoryUserRepository;
    repository.clear();

    jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a user and hashes the password', async () => {
      const user = await service.create('test@example.com', 'password');

      expect(user).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: 'test@example.com',
          password: 'hashed_password',
        }),
      );
      expect(user.createdAt).toEqual(new Date('2025-01-01T00:00:00.000Z'));
      expect(user.updatedAt).toEqual(new Date('2025-01-01T00:00:00.000Z'));
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);

      const storedUser = await service.findOne(user.email);
      expect(storedUser).toMatchObject({
        id: user.id,
        email: user.email,
      });
    });

    it('throws if email already exists', async () => {
      await service.create('test@example.com', 'password');

      await expect(
        service.create('test@example.com', 'password'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('returns a user by email', async () => {
      await service.create('test@example.com', 'password');

      const user = await service.findOne('test@example.com');

      expect(user?.email).toBe('test@example.com');
    });

    it('returns undefined for a missing email', async () => {
      const user = await service.findOne('missing@example.com');

      expect(user).toBeUndefined();
    });
  });

  describe('findOneById', () => {
    it('returns a user by id', async () => {
      const created = await service.create('test@example.com', 'password');

      const found = await service.findOneById(created.id);

      expect(found?.id).toBe(created.id);
    });

    it('returns undefined for a missing id', async () => {
      const user = await service.findOneById('missing-id');

      expect(user).toBeUndefined();
    });
  });

  describe('update', () => {
    it('throws when user is missing', async () => {
      const dto: UpdateUserDto = { email: 'new@example.com' };

      await expect(service.update('missing', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates the email', async () => {
      const created = await service.create('test@example.com', 'password');
      const previousUpdatedAt = created.updatedAt;

      jest.setSystemTime(new Date('2025-01-01T00:00:10.000Z'));

      const dto: UpdateUserDto = { email: 'new@example.com' };
      const updated = await service.update(created.id, dto);

      expect(updated.email).toBe('new@example.com');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        previousUpdatedAt.getTime(),
      );
      expect(updated.updatedAt).toEqual(new Date('2025-01-01T00:00:10.000Z'));
    });

    it('updates and hashes the password', async () => {
      const created = await service.create('test@example.com', 'password');
      const previousUpdatedAt = created.updatedAt;

      jest.setSystemTime(new Date('2025-01-01T00:00:10.000Z'));

      const dto: UpdateUserDto = { password: 'newpassword' };
      const updated = await service.update(created.id, dto);

      expect(updated.password).toBe('hashed_newpassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        previousUpdatedAt.getTime(),
      );
      expect(updated.updatedAt).toEqual(new Date('2025-01-01T00:00:10.000Z'));
    });

    it('updates email and password together', async () => {
      const created = await service.create('test@example.com', 'password');
      const previousUpdatedAt = created.updatedAt;

      jest.setSystemTime(new Date('2025-01-01T00:00:10.000Z'));

      const dto: UpdateUserDto = {
        email: 'new@example.com',
        password: 'newpassword',
      };
      const updated = await service.update(created.id, dto);

      expect(updated.email).toBe('new@example.com');
      expect(updated.password).toBe('hashed_newpassword');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        previousUpdatedAt.getTime(),
      );
      expect(updated.updatedAt).toEqual(new Date('2025-01-01T00:00:10.000Z'));
    });
  });

  describe('remove', () => {
    it('throws when user is missing', async () => {
      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('removes an existing user', async () => {
      const created = await service.create('test@example.com', 'password');

      const result = await service.remove(created.id);

      expect(result.id).toBe(created.id);
      const lookup = await service.findOneById(created.id);
      expect(lookup).toBeUndefined();
    });
  });
});
