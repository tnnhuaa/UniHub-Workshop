import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer, jwt } from 'better-auth/plugins';
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

  return betterAuth({
    basePath: BASE_PATH,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    emailAndPassword: { enabled: true },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
        ...(redirectUri ? { redirectURI: redirectUri } : {}),
      },
    },
    session: {
      expiresIn: parseDurationToSeconds(env.BETTER_AUTH_SESSION_TTL),
    },
    plugins: [
      bearer(),
      jwt({
        jwt: {
          issuer: env.BETTER_AUTH_JWT_ISSUER,
          audience: env.BETTER_AUTH_JWT_AUDIENCE,
          expirationTime: env.BETTER_AUTH_JWT_TTL,
        },
      }),
    ],
    advanced: {
      defaultCookieAttributes: {
        sameSite: 'strict',
        secure: secureCookies,
      },
    },
  });
};
