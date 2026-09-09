import { create } from 'zustand';
import type { ConvertedDocument, ConversionOptions, ConversionMode, ViewMode } from '../types';
import { createSampleDocument, generateSamplePdfBlob } from '../lib/samples';

interface ConverterState {
  documents: ConvertedDocument[];
  activeDocId: string | null;
  options: ConversionOptions;
  viewMode: ViewMode;
  syncScroll: boolean;
  isConverting: boolean;
  showArchModal: boolean;
  showUserGuide: boolean;
  searchQuery: string;

  // Actions
  setDocuments: (docs: ConvertedDocument[]) => void;
  addDocument: (doc: ConvertedDocument) => void;
  updateDocument: (id: string, updates: Partial<ConvertedDocument>) => void;
  removeDocument: (id: string) => void;
  setActiveDocId: (id: string) => void;
  updateActiveMarkdown: (markdown: string) => void;
  updateOptions: (updates: Partial<ConversionOptions>) => void;
  setViewMode: (mode: ViewMode) => void;
  setSyncScroll: (enabled: boolean) => void;
  setShowArchModal: (show: boolean) => void;
  setShowUserGuide: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  clearAll: () => void;
  loadSample: (presetId: string) => Promise<void>;
  convertFile: (file: File) => Promise<ConvertedDocument | null>;
}

const DEFAULT_OPTIONS: ConversionOptions = {
  mode: 'fast',
  preservePageBreaks: true,
  includeTOC: false,
  formatTables: true,
  cleanLineBreaks: true,
  stripHeadersFooters: true,
};

export const useConverterStore = create<ConverterState>((set, get) => ({
  documents: [createSampleDocument('sample-financial')],
  activeDocId: null,
  options: DEFAULT_OPTIONS,
  viewMode: 'split',
  syncScroll: true,
  isConverting: false,
  showArchModal: false,
  showUserGuide: false,
  searchQuery: '',

  setDocuments: (docs) => set({ documents: docs }),

  addDocument: (doc) =>
    set((state) => ({
      documents: [doc, ...state.documents],
      activeDocId: doc.id,
    })),

  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    })),

  removeDocument: (id) =>
    set((state) => {
      const remaining = state.documents.filter((d) => d.id !== id);
      const nextActiveId =
        state.activeDocId === id
          ? remaining.length > 0
            ? remaining[0].id
            : null
          : state.activeDocId;
      return {
        documents: remaining,
        activeDocId: nextActiveId,
      };
    }),

  setActiveDocId: (id) => set({ activeDocId: id }),

  updateActiveMarkdown: (markdown) =>
    set((state) => {
      if (!state.activeDocId) return state;
      return {
        documents: state.documents.map((doc) =>
          doc.id === state.activeDocId ? { ...doc, markdown } : doc
        ),
      };
    }),

  updateOptions: (updates) =>
    set((state) => ({
      options: { ...state.options, ...updates },
    })),

  setViewMode: (mode) => set({ viewMode: mode }),

  setSyncScroll: (syncScroll) => set({ syncScroll }),

  setShowArchModal: (showArchModal) => set({ showArchModal }),

  setShowUserGuide: (showUserGuide) => set({ showUserGuide }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  clearAll: () => set({ documents: [], activeDocId: null }),

  loadSample: async (presetId) => {
    let blobUrl: string | undefined;
    try {
      blobUrl = await generateSamplePdfBlob(presetId);
    } catch {
      // ignore
    }
    const sample = createSampleDocument(presetId, blobUrl);
    set((state) => ({
      documents: [sample, ...state.documents.filter((d) => d.id !== sample.id)],
      activeDocId: sample.id,
    }));
  },

  convertFile: async (file: File) => {
    const { options, addDocument, updateDocument } = get();
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();
    const pdfBlobUrl = URL.createObjectURL(file);

    const initialDoc: ConvertedDocument = {
      id: docId,
      name: file.name,
      originalSize: file.size,
      pageCount: 1,
      markdown: '',
      status: 'uploading',
      progress: 15,
      currentStep: 'Streaming PDF into in-memory buffer...',
      createdAt: Date.now(),
      modeUsed: options.mode,
      pdfBlobUrl,
    };

    addDocument(initialDoc);
    set({ isConverting: true });

    try {
      // Simulate stepped progress
      setTimeout(() => {
        updateDocument(docId, {
          progress: 45,
          currentStep:
            options.mode === 'fast'
              ? 'Parsing PDF text streams & extracting layout...'
              : 'Sending to AI Vision engine for OCR & table structuring...',
        });
      }, 400);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          if (errData.error) errorMsg = errData.error;
        } catch {
          // fallback to status
        }
        throw new Error(errorMsg);
      }

      updateDocument(docId, {
        progress: 85,
        currentStep: 'Reconstructing Markdown & generating AST...',
      });

      const data = await response.json();
      const elapsed = Math.round(performance.now() - startTime);

      const finalDoc: Partial<ConvertedDocument> = {
        markdown: data.markdown || '# Empty Document',
        rawText: data.rawText || '',
        pageCount: data.pageCount || 1,
        status: 'ready',
        progress: 100,
        currentStep: 'Conversion Complete',
        durationMs: elapsed,
        modeUsed: data.modeUsed || options.mode,
        pdfBlobUrl,
      };

      updateDocument(docId, finalDoc);
      set({ isConverting: false });

      return {
        ...initialDoc,
        ...finalDoc,
      } as ConvertedDocument;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Unknown conversion failure';
      updateDocument(docId, {
        status: 'error',
        progress: 100,
        currentStep: 'Failed',
        error: errorMsg,
      });
      set({ isConverting: false });
      return null;
    }
  },
}));
