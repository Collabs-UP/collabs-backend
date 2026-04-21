import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { ENV_KEYS } from 'src/config/env';
import { JwtAuthGuard } from 'src/services/auth/guards/JwtAuthGuard';
import { AuthService } from 'src/services/auth/services/AuthService';
import { UpdateUserDto } from 'src/services/users/dto/UpdateUserDto';
import { UserService } from 'src/services/users/services/UserService';

type AuthRequest = Request & {
  user: { id: string; email: string; name: string };
};

type GoogleAuthRequest = Request & {
  user: { email: string; name: string };
};

type OAuthSession = {
  access_token: string;
};

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return req.user;
  }

  @Get('me/oauth/google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    return undefined;
  }

  @Get('me/oauth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: GoogleAuthRequest,
    @Res() res: Response,
  ) {
    const session: OAuthSession = await this.authService.loginWithGoogle({
      email: req.user.email,
      name: req.user.name,
    });
    const callbackBaseUrl = this.configService
      .getOrThrow<string>(ENV_KEYS.CORS_ORIGIN)
      .replace(/\/$/, '');
    const callbackUrl = `${callbackBaseUrl}/auth/callback?access_token=${encodeURIComponent(session.access_token)}`;

    return res.redirect(callbackUrl);
  }

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
