import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthResolver } from './auth.resolver.js';
import { AuthService } from './auth.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { GqlAuthGuard } from './gql-auth.guard.js';
import { JwtStrategy } from './jwt.strategy.js';

const MINIMUM_SECRET_LENGTH = 32;
const EXAMPLE_SECRET = 'replace-with-a-random-value-of-at-least-32-characters';

@Module({
  imports: [
    DatabaseModule,
    // `register` is what provides AuthModuleOptions, which the guard injects.
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_SECRET');

        // Fail at boot rather than signing tokens with a weak secret at runtime.
        if (secret === EXAMPLE_SECRET || secret.length < MINIMUM_SECRET_LENGTH) {
          throw new Error(
            'JWT_SECRET must be a unique value of at least 32 characters, not the example placeholder.',
          );
        }

        return {
          secret,
          signOptions: {
            audience: config.getOrThrow<string>('JWT_AUDIENCE'),
            // Validated by `jsonwebtoken` at signing time; the config type is narrower than `string`.
            expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN') as JwtSignOptions['expiresIn'],
            issuer: config.getOrThrow<string>('JWT_ISSUER'),
          },
        };
      },
    }),
  ],
  providers: [AuthResolver, AuthService, GqlAuthGuard, JwtStrategy],
  exports: [GqlAuthGuard, PassportModule],
})
export class AuthModule {}
