import {
  Body,
  Controller,
  Delete,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/services/auth/guards/JwtAuthGuard';
import { UpdateUserDto } from 'src/services/users/dto/UpdateUserDto';
import { UserService } from 'src/services/users/services/UserService';

type AuthRequest = Request & {
  user: { id: string; email: string; name: string };
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: AuthRequest, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  deleteMe(@Req() req: AuthRequest) {
    return this.usersService.deleteMe(req.user.id);
  }
}
