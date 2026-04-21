import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from '../dto/RegisterDto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/LoginDto';

type SessionUser = {
  id: string;
  email: string;
  name: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildSessionResponse({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  }

  async loginWithGoogle(profile: { email: string; name: string }) {
    const normalizedEmail = profile.email.trim().toLowerCase();

    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          name: profile.name.trim(),
          password: null,
        },
        select: { id: true, email: true, name: true },
      });
    }

    return this.buildSessionResponse(user);
  }

  private async buildSessionResponse(user: SessionUser) {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      access_token: token,
      token_type: 'Bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
