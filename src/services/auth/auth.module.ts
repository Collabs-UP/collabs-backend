import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AuthController } from './controllers/AuthController';
import { AuthService } from './services/AuthService';
import { JwtStrategy } from './guards/JwtStrategy';


@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const raw = configService.get<string>('JWT_EXPIRES_IN') ?? '1d';
        const expiresIn = /^\d+$/.test(raw) ? Number(raw) : (raw as StringValue);

        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}