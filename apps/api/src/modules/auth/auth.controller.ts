import { All, Controller, Get, Inject, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { BetterAuthInstance } from './auth.service.js';
import { AuthService } from './auth.service.js';
import { BETTER_AUTH_INSTANCE } from './auth.constants.js';

type FastifyRequestWithRawBody = FastifyRequest & {
  rawBody?: Buffer | string;
};

type HeadersWithOptionalSetCookie = Headers & {
  getSetCookie?: (() => string[]) | undefined;
};

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(BETTER_AUTH_INSTANCE)
    private readonly auth: BetterAuthInstance,
    private readonly authService: AuthService,
  ) {}

  private buildHeaders(request: FastifyRequest) {
    const headers = new Headers();

    Object.entries(request.headers).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      if (Array.isArray(value)) {
        headers.set(key, value.join(','));
        return;
      }

      headers.set(key, String(value));
    });

    return headers;
  }

  private buildBody(request: FastifyRequestWithRawBody): BodyInit | undefined {
    const method = request.method.toUpperCase();

    if (method === 'GET' || method === 'HEAD') {
      return undefined;
    }

    const rawBody = request.rawBody;

    if (rawBody !== undefined && rawBody !== null) {
      if (typeof rawBody === 'string') {
        return rawBody;
      }

      if (Buffer.isBuffer(rawBody)) {
        return new Uint8Array(rawBody);
      }
    }

    if (request.body === undefined || request.body === null) {
      return undefined;
    }

    if (typeof request.body === 'string') {
      return request.body;
    }

    return JSON.stringify(request.body);
  }

  private buildUrl(request: FastifyRequest) {
    const forwardedProto = request.headers['x-forwarded-proto'];
    const protocol =
      (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ??
      (request as { protocol?: string }).protocol ??
      'http';
    const host = request.headers.host ?? 'localhost';

    return new URL(request.url, `${protocol}://${host}`);
  }

  private applyCorsHeaders(request: FastifyRequest, reply: FastifyReply) {
    const origin = request.headers.origin;

    if (!origin) {
      return;
    }

    reply.raw.setHeader('Access-Control-Allow-Origin', origin);
    reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
    reply.raw.setHeader('Vary', 'Origin');
  }

  @Get('get-session')
  async getSession(@Req() request: FastifyRequest) {
    const session = await this.authService.getSessionFromRequest(request);

    if (!session?.user?.id) {
      return {
        session: null,
        user: null,
        roles: [] as string[],
        role: null as string | null,
      };
    }

    const roles = await this.authService.getUserRolesValues(session.user.id);

    return {
      session: session.session,
      user: session.user,
      roles,
    };
  }

  @All('*')
  async handle(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    const url = this.buildUrl(request);
    const authResponse = await this.auth.handler(
      new Request(url, {
        method: request.method,
        headers: this.buildHeaders(request),
        body: this.buildBody(request),
      }),
    );

    const responseHeaders = authResponse.headers;
    const responseHeadersWithCookies =
      responseHeaders as HeadersWithOptionalSetCookie;
    const setCookies =
      responseHeadersWithCookies.getSetCookie?.() ??
      (responseHeaders.get('set-cookie')
        ? [responseHeaders.get('set-cookie') as string]
        : []);

    reply.hijack();
    this.applyCorsHeaders(request, reply);

    responseHeaders.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        return;
      }

      reply.raw.setHeader(key, value);
    });

    if (setCookies.length > 0) {
      reply.raw.setHeader('Set-Cookie', setCookies);
    }

    reply.raw.statusCode = authResponse.status;

    if (request.method.toUpperCase() === 'HEAD') {
      reply.raw.end();
      return reply;
    }

    const responseBody = await authResponse.arrayBuffer();
    reply.raw.end(Buffer.from(responseBody));
    return reply;
  }
}
