export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');
export const LLM_CLIENT = Symbol('LLM_CLIENT');

export type UploadWorkshopDocumentInput = {
  workshopId: string;
  fileName: string;
  contentBase64: string;
  contentType: 'application/pdf';
};

export type UploadWorkshopDocumentResult = {
  fileName: string;
  fileUrl: string;
};

export interface IObjectStorage {
  uploadWorkshopDocument(
    input: UploadWorkshopDocumentInput,
  ): Promise<UploadWorkshopDocumentResult>;
}

export type SummarizeDocumentInput = {
  documentId: string;
  workshopId: string;
  fileName: string;
  fileUrl: string;
};

export type SummarizeDocumentResult = {
  summaryText: string;
};

export interface ILLMClient {
  summarizeDocument(
    input: SummarizeDocumentInput,
  ): Promise<SummarizeDocumentResult>;
}
