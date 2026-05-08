import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { ZodValidationPipe } from '../../shared/validation/index.js';
import {
  paymentMockActionSchema,
  paymentWebhookSchema,
  type PaymentMockActionInput,
  type PaymentWebhookInput,
} from './payment.schemas.js';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  handleWebhook(
    @Body(new ZodValidationPipe(paymentWebhookSchema))
    body: PaymentWebhookInput,
  ) {
    return this.paymentService.handleWebhook(body);
  }

  @Post('mock/success')
  mockSuccess(
    @Body(new ZodValidationPipe(paymentMockActionSchema))
    body: PaymentMockActionInput,
  ) {
    return this.paymentService.markPaymentSuccess(body);
  }

  @Post('mock/failure')
  mockFailure(
    @Body(new ZodValidationPipe(paymentMockActionSchema))
    body: PaymentMockActionInput,
  ) {
    return this.paymentService.markPaymentFailure(body);
  }
}
