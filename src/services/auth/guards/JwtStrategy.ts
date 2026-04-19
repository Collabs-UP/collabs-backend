import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ENV_KEYS } from '../../../config/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(ENV_KEYS.JWT_SECRET),
    });
  }

  validate(payload: { sub: string; email: string; name: string }) {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
