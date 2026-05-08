import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';

/**
 * AuthModule — BetterAuth integration placeholder.
 * Will provide hybrid session/JWT auth flow.
 *
 * @see blueprint/specs/auth.md
 */
@Module({
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
