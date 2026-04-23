import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ENV_KEYS, type JwtExpiresIn } from '../../config/env';
import { AuthController } from './controllers/AuthController';
import { JwtStrategy } from './guards/JwtStrategy';
import { AuthService } from './services/AuthService';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn = configService.getOrThrow<JwtExpiresIn>(
          ENV_KEYS.JWT_EXPIRES_IN,
        );

        return {
          secret: configService.getOrThrow<string>(ENV_KEYS.JWT_SECRET),
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
