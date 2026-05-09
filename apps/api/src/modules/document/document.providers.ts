import { Injectable } from '@nestjs/common';
import type {
  ILLMClient,
  IObjectStorage,
  SummarizeDocumentInput,
  SummarizeDocumentResult,
  UploadWorkshopDocumentInput,
  UploadWorkshopDocumentResult,
} from './document.adapters.js';

@Injectable()
export class MockObjectStorageProvider implements IObjectStorage {
  uploadWorkshopDocument(
    input: UploadWorkshopDocumentInput,
  ): Promise<UploadWorkshopDocumentResult> {
    const safeFileName = input.fileName.replace(/\s+/g, '-').toLowerCase();
    const objectKey = `${Date.now()}-${safeFileName}`;

    void input.contentBase64;
    void input.contentType;

    return Promise.resolve({
      fileName: safeFileName,
      fileUrl: `mock://workshop-documents/${input.workshopId}/${objectKey}`,
    });
  }
}

@Injectable()
export class MockLlmClientProvider implements ILLMClient {
  summarizeDocument(
    input: SummarizeDocumentInput,
  ): Promise<SummarizeDocumentResult> {
    return Promise.resolve({
      summaryText: `Auto summary for ${input.fileName} (${input.documentId}).`,
    });
  }
}
