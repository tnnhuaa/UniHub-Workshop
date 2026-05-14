import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DocumentController } from './document.controller.js';
import { DocumentService } from './document.service.js';
import { LLM_CLIENT, OBJECT_STORAGE } from './document.adapters.js';
import {
  GeminiLlmClientProvider,
  LocalObjectStorageProvider,
} from './document.providers.js';

@Module({
  imports: [AuthModule],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    {
      provide: OBJECT_STORAGE,
      useClass: LocalObjectStorageProvider,
    },
    {
      provide: LLM_CLIENT,
      useClass: GeminiLlmClientProvider,
    },
  ],
  exports: [DocumentService],
})
export class DocumentModule {}
