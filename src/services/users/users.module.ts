import { Module } from '@nestjs/common';
import { UsersController } from './controllers/UserController';
import { UserService } from './services/UserService';

@Module({
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
