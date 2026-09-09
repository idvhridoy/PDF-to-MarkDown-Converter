import JSZip from 'jszip';
import type { ConvertedDocument } from '../types';

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePdfFile(file: File): FileValidationResult {
  const isPdfExtension = file.name.toLowerCase().endsWith('.pdf');
  const isPdfMime = file.type === 'application/pdf' || file.type === '';

  if (!isPdfExtension && !isPdfMime) {
    return {
      valid: false,
      error: `"${file.name}" is not a valid PDF document. Please upload files with .pdf extension.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `"${file.name}" (${sizeMb} MB) exceeds the maximum allowed file size of 25 MB.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: `"${file.name}" is empty (0 bytes).`,
    };
  }

  return { valid: true };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function downloadFile(content: string, filename: string, mimeType = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function downloadBulkZip(documents: ConvertedDocument[], zipFilename = 'converted-markdown-docs.zip') {
  const zip = new JSZip();
  const folder = zip.folder('markdown_exports');

  documents.forEach((doc, idx) => {
    if (doc.status === 'ready' && doc.markdown) {
      const baseName = doc.name.replace(/\.[^/.]+$/, '');
      const cleanName = `${String(idx + 1).padStart(2, '0')}-${baseName}.md`;
      folder?.file(cleanName, doc.markdown);
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = zipFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function calculateReadTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
