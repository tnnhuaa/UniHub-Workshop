import { Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service.js';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  handleWebhook() {
    // TODO: Implement payment webhook processing
    return this.paymentService.handleWebhook();
  }
}
