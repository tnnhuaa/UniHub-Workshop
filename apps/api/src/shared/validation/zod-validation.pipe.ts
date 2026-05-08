import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod/v4';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodTypeAny) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: result.error.flatten(),
      });
    }
    return result.data;
  }
}
