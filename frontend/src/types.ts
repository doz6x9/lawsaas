export type ProcessingState = 'idle' | 'uploading' | 'processing' | 'readyToDownload' | 'success' | 'error';

export type OutputFormat = 'excel' | 'docx' | 'both';

export interface FileState {
  excelFile: File | null;
  outputFormat: OutputFormat;
  importContacts: boolean;
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'current' | 'completed';
}

export interface ProcessedFile {
  filename: string;
  mimeType: string;
  base64Content: string;
}

export interface DirectoryContact {
  idInfringer: string;
  company: string;
  phone: string;
  caseCount: number;
  clientNames: string;
}

export interface ConflictSearchResult {
  idCase: string;
  matchType: 'Client Name' | 'Infringer Company' | 'Infringer Phone';
  matchedText: string;
}
