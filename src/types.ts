export type ProcessingState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export interface FileState {
  excelFile: File | null;
  imageFiles: File[];
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'current' | 'completed';
}
