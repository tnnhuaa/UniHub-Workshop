import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod/v4';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  private reply(
    host: ArgumentsHost,
    statusCode: number,
    body: Record<string, unknown>,
  ) {
    const { httpAdapter } = this.adapterHost;
    const response: unknown = host.switchToHttp().getResponse();
    httpAdapter.reply(response, body, statusCode);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<FastifyRequest>();

    const timestamp = new Date().toISOString();
    const path = request.url ?? request.raw.url ?? '';

    if (exception instanceof z.ZodError) {
      this.reply(host, HttpStatus.BAD_REQUEST, {
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

      this.reply(host, status, {
        statusCode: status,
        code: responseBody.code ?? HttpStatus[status] ?? 'ERROR',
        message: message ?? HttpStatus[status] ?? 'Error',
        details: responseBody.details ?? responseBody.errors ?? null,
        path,
        timestamp,
      });
      return;
    }

    this.logger.error('Unhandled exception', exception);

    this.reply(host, HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected error',
      details: null,
      path,
      timestamp,
    });
  }
}
