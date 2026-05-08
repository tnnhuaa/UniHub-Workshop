import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { toNodeHandler } from 'better-auth/node';
import type { BetterAuthInstance } from './auth.service.js';
import { BETTER_AUTH_INSTANCE } from './auth.constants.js';

@Controller('auth')
export class AuthController {
  private readonly handler: ReturnType<typeof toNodeHandler>;

  constructor(
    @Inject(BETTER_AUTH_INSTANCE)
    auth: BetterAuthInstance,
  ) {
    this.handler = toNodeHandler(auth);
  }

  @All('*')
  async handle(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    await this.handler(request.raw, reply.raw);
    return reply;
  }
}
