import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/service/user.service';
import { User } from 'src/user/schema/user.schema';
import { BadRequestException } from '@nestjs/common';
import { TokenService } from 'src/token/service/token.service';
import { envValidator } from 'src/env/validator/env.validator';
import { AuthService } from '../service/auth.service';
import { hash } from 'src/utils/functions/password.function';

describe('AuthController', () => {
  let controller: AuthController;
  let mockUserService: UserService;
  let mockUserModel: Model<User>;

  const testCreateUserDto = {
    email: 'johndoe@gmail.com',
    password: '<PASSWORD>',
    username: '',
    avatar: 'http://example.com',
  };
  const user = new User();
  (async () => {
    user.email = testCreateUserDto.email;
    user.password = await hash(testCreateUserDto.password);
    user.avatar = testCreateUserDto.avatar;
    user.username = testCreateUserDto.username || `user-xxxx`;
  })();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        TokenService,
        {
          provide: getModelToken(User.name),
          useValue: {
            create: jest.fn().mockResolvedValue(user),
            findOne: jest.fn().mockResolvedValue(user),
          },
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test'],
          validationSchema: envValidator,
        }),
      ],
    }).compile();
    mockUserModel = module.get<Model<User>>(getModelToken(User.name));
    controller = module.get<AuthController>(AuthController);
    mockUserService = module.get<UserService>(UserService);
  });

  describe('Register', () => {
    it('Should return user object', async () => {
      mockUserModel.findOne = jest.fn().mockResolvedValueOnce(null);
      const { user: u } = await controller.register(testCreateUserDto);
      expect(u).toBeDefined();
      expect(u.username).toBeDefined();
      expect(u.email).toBeDefined();
      expect(u).toMatchObject(user);
    });

    it('Must accept password and email', async () => {
      const tests = [
        {
          email: '',
          password: '',
        },
        {
          email: 'johndoe@gmail.com',
          password: '',
        },
        {
          email: '',
          password: '<PASSWORD>',
        },
      ];
      for (const test of tests) {
        expect(controller.register(test)).rejects.toThrow(BadRequestException);
      }
    });
  });

  describe('Login', () => {
    beforeEach(async () => {
      mockUserService.findOneSelectAndPopulateOrErrorOut = jest
        .fn()
        .mockResolvedValue({
          ...user,
          verificationCode: '1234',
          save: jest.fn().mockResolvedValue(user),
        });
    });
    it('Should return user object', async () => {
      mockUserModel.findOne = jest.fn().mockResolvedValueOnce(user);
      const { user: u } = await controller.login(testCreateUserDto);
      expect(u).toMatchObject(user);
    });

    it('Should return user token', async () => {
      mockUserModel.findOne = jest.fn().mockResolvedValueOnce(user);
      const { token } = await controller.login(testCreateUserDto);
      expect(token).toBeDefined();
    });

    // TODO: Move to e2e tests
    // it('Must accept password and email', async () => {
    //   const tests = [
    //     {
    //       email: '',
    //       password: '',
    //     },
    //     {
    //       email: 'johndoe@gmail.com',
    //       password: '',
    //     },
    //     {
    //       email: '',
    //       password: '<PASSWORD>',
    //     },
    //   ];
    //   for (const test of tests) {
    //     expect(controller.login(test)).rejects.toThrow(BadRequestException);
    //   }
    // });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
