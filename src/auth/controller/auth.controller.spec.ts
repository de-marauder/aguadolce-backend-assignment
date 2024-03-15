import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/service/user.service';
import { User } from 'src/user/schema/user.schema';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: Model<User>,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('Register', () => {
    it('Should return user object', async () => {
      const register = await controller.register({});

      expect(register).toBeDefined();
      expect(register.username).toBeDefined();
      expect(register.email).toBeDefined();
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
