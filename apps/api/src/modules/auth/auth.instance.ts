import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer } from 'better-auth/plugins';
import type { Env } from '../../config/env.schema.js';
import type { PrismaService } from '../prisma/prisma.service.js';

const BASE_PATH = '/api/v1/auth';

const parseDurationToSeconds = (value: string): number => {
  const match = value.trim().match(/^(\d+)(s|m|h|d)$/i);
  if (!match) {
    throw new Error(`Invalid duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      throw new Error(`Unsupported duration unit: ${value}`);
  }
};

export const createBetterAuthInstance = (prisma: PrismaService, env: Env) => {
  const secureCookies = env.NODE_ENV === 'production';
  const redirectUri = env.GOOGLE_OAUTH_REDIRECT_URI;
  const authUrl =
    env.BETTER_AUTH_URL || `http://localhost:${env.PORT}${BASE_PATH}`;
  const authOrigin = new URL(authUrl).origin;
  const corsOrigins = String(env.CORS_ORIGIN)
    .split(',')
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);

  const trustedOrigins = Array.from(
    new Set<string>([
      ...corsOrigins,
      authOrigin,
      `http://127.0.0.1:${env.PORT}`,
      `http://localhost:${env.PORT}`,
      `http://0.0.0.0:${env.PORT}`,
    ]),
  );
  console.log('BetterAuth Trusted Origins:', trustedOrigins);
  return betterAuth({
    basePath: BASE_PATH,
    baseURL: authUrl,
    trustedOrigins,
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    user: {
      modelName: 'BetterAuthUser',
    },
    session: {
      modelName: 'BetterAuthSession',
      expiresIn: parseDurationToSeconds(env.BETTER_AUTH_SESSION_TTL),
    },
    account: {
      modelName: 'BetterAuthAccount',
    },
    verification: {
      modelName: 'BetterAuthVerification',
    },
    emailAndPassword: { enabled: true },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
        ...(redirectUri ? { redirectURI: redirectUri } : {}),
      },
    },
    plugins: [bearer()],
    advanced: {
      defaultCookieAttributes: {
        sameSite: secureCookies ? 'none' : 'lax',
        secure: secureCookies,
      },
    },
  });
};
