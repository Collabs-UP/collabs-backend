import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ENV_KEYS } from '../../../config/env';

type GoogleUserProfile = {
  email: string;
  name: string;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>(ENV_KEYS.GOOGLE_CLIENT_ID),
      clientSecret: configService.getOrThrow<string>(ENV_KEYS.GOOGLE_CLIENT_SECRET),
      callbackURL: configService.getOrThrow<string>(ENV_KEYS.GOOGLE_CALLBACK_URL),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: GoogleUserProfile | false) => void,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();
    const name =
      profile.displayName?.trim() ||
      [profile.name?.givenName, profile.name?.familyName]
        .filter(Boolean)
        .join(' ')
        .trim();

    if (!email || !name) {
      return done(
        new UnauthorizedException('Google profile is missing required data'),
        false,
      );
    }

    return done(null, {
      email,
      name,
    });
  }
}
