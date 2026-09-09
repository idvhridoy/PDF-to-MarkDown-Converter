export type ConversionMode = 'fast' | 'ocr' | 'unstructured';

export interface ConversionOptions {
  mode: ConversionMode;
  preservePageBreaks: boolean;
  includeTOC: boolean;
  formatTables: boolean;
  cleanLineBreaks: boolean;
  stripHeadersFooters: boolean;
}

export type DocumentStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'error';

export type ViewMode = 'split' | 'editor' | 'preview' | 'compare' | 'pdf';

export interface ConvertedDocument {
  id: string;
  name: string;
  originalSize: number;
  pageCount: number;
  markdown: string;
  rawText?: string;
  status: DocumentStatus;
  progress: number;
  currentStep: string;
  durationMs?: number;
  error?: string;
  createdAt: number;
  modeUsed: ConversionMode;
  pdfBlobUrl?: string;
}

export interface SampleDocumentPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  pageCount: number;
  sizeBytes: number;
  badge: string;
  filename: string;
}
