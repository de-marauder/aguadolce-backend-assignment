import { Controller, Logger } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private userService: UserService) { }
}
