import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  ILLMClient,
  IObjectStorage,
  SummarizeDocumentInput,
  SummarizeDocumentResult,
  UploadWorkshopDocumentInput,
  UploadWorkshopDocumentResult,
} from './document.adapters.js';
import type { Env } from '../../config/env.schema.js';

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

@Injectable()
export class LocalObjectStorageProvider implements IObjectStorage {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  async uploadWorkshopDocument(
    input: UploadWorkshopDocumentInput,
  ): Promise<UploadWorkshopDocumentResult> {
    const storagePath = this.configService.get('DOCUMENT_STORAGE_PATH', {
      infer: true,
    });
    await mkdir(storagePath, { recursive: true });

    const safeFileName = input.fileName.replace(/\s+/g, '-').toLowerCase();
    const objectKey = `${Date.now()}-${safeFileName}`;
    const targetPath = path.join(storagePath, objectKey);

    const buffer = Buffer.from(input.contentBase64, 'base64');
    await writeFile(targetPath, buffer);

    return {
      fileName: safeFileName,
      fileUrl: `file://${targetPath}`,
    };
  }
}

@Injectable()
export class GeminiLlmClientProvider implements ILLMClient {
  private static readonly MODEL_NAME = 'gemini-2.5-flash';
  private static readonly MAX_OUTPUT_TOKENS = 1024;

  constructor(private readonly configService: ConfigService<Env, true>) {}

  async summarizeDocument(
    input: SummarizeDocumentInput,
  ): Promise<SummarizeDocumentResult> {
    const apiKey = this.configService.get('GEMINI_API_KEY', { infer: true });
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const documentBase64 = await this.loadDocumentBase64(input.fileUrl);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GeminiLlmClientProvider.MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: 'Summarize this workshop PDF in 5-8 sentences. Focus on key topics, speaker highlights, and any action items.',
                },
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: documentBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens:
              GeminiLlmClientProvider.MAX_OUTPUT_TOKENS,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
    };

    const primaryCandidate = payload.candidates?.[0];
    const summaryText =
      primaryCandidate?.content?.parts
        ?.map((part) => part.text?.trim() ?? '')
        .filter((text) => text.length > 0)
        .join('\n')
        .trim() || 'Summary not available.';

    return { summaryText };
  }

  private async loadDocumentBase64(fileUrl: string): Promise<string> {
    if (fileUrl.startsWith('file://')) {
      const filePath = fileUrl.replace('file://', '');
      const buffer = await import('node:fs/promises').then(({ readFile }) =>
        readFile(filePath),
      );
      return buffer.toString('base64');
    }

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer).toString('base64');
    }

    throw new Error(`Unsupported file URL: ${fileUrl}`);
  }
}
