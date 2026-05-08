import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod/v4';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const reply = context.getResponse<FastifyReply>();

    const timestamp = new Date().toISOString();
    const path = request.url ?? request.raw.url ?? '';

    if (exception instanceof z.ZodError) {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: exception.flatten(),
        path,
        timestamp,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const responseBody =
        typeof response === 'string'
          ? { message: response }
          : (response as Record<string, unknown>);

      const rawMessage = responseBody.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(', ')
        : (rawMessage as string | undefined);

      reply.status(status).send({
        statusCode: status,
        code: (responseBody.code as string) ?? HttpStatus[status] ?? 'ERROR',
        message: message ?? HttpStatus[status] ?? 'Error',
        details: responseBody.details ?? responseBody.errors ?? null,
        path,
        timestamp,
      });
      return;
    }

    reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected error',
      details: null,
      path,
      timestamp,
    });
  }
}
