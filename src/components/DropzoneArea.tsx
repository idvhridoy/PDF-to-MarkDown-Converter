import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  FileCheck2,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Sliders,
  File,
  X,
  RefreshCw,
} from 'lucide-react';
import { useConverterStore } from '../store/useConverterStore';
import { validatePdfFile, formatBytes } from '../lib/pdfUtils';
import { SAMPLE_PRESETS } from '../lib/samples';
import { toast } from 'sonner';

export default function DropzoneArea() {
  const {
    documents,
    activeDocId,
    options,
    isConverting,
    convertFile,
    setActiveDocId,
    removeDocument,
    updateOptions,
    loadSample,
  } = useConverterStore();

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: unknown[]) => {
      if (fileRejections && fileRejections.length > 0) {
        toast.error('One or more files could not be accepted. Please ensure files are valid PDFs under 25MB.');
      }

      if (acceptedFiles.length === 0) return;

      for (const file of acceptedFiles) {
        const validation = validatePdfFile(file);
        if (!validation.valid) {
          toast.error(validation.error || 'Invalid file.');
          continue;
        }

        toast.info(`Uploading "${file.name}" for conversion...`);
        const result = await convertFile(file);
        if (result && result.status === 'ready') {
          toast.success(`Converted "${file.name}" (${result.pageCount} pages, ${result.durationMs}ms)!`);
        } else if (result && result.status === 'error') {
          toast.error(`Failed to convert "${file.name}": ${result.error}`);
        }
      }
    },
    [convertFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 25 * 1024 * 1024,
    multiple: true,
  });

  return (
    <div className="bg-white border-b border-slate-200 p-4 sm:p-6 shadow-2xs">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top bar: Conversion mode selection & Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Engine:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-100">
              <button
                id="mode-fast-btn"
                type="button"
                onClick={() => updateOptions({ mode: 'fast' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  options.mode === 'fast'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fast Text (Local Node.js)</span>
              </button>
              <button
                id="mode-ocr-btn"
                type="button"
                onClick={() => updateOptions({ mode: 'ocr' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  options.mode === 'ocr'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>OCR & Complex Layout (AI Vision)</span>
              </button>
            </div>
          </div>

          {/* Preset Samples Quick Action */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Quick Test:</span>
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  loadSample(preset.id);
                  toast.success(`Loaded sample: ${preset.title}`);
                }}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors"
              >
                {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}
              </button>
            ))}

            {/* Toggle Preferences Accordion */}
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                showAdvancedOptions
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Options</span>
            </button>
          </div>
        </div>

        {/* Advanced Options Bar */}
        {showAdvancedOptions && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.preservePageBreaks}
                onChange={(e) => updateOptions({ preservePageBreaks: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-slate-700 font-medium">Preserve Page Breaks</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.formatTables}
                onChange={(e) => updateOptions({ formatTables: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-slate-700 font-medium">Auto-Format Tables</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.includeTOC}
                onChange={(e) => updateOptions({ includeTOC: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-slate-700 font-medium">Generate Table of Contents</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.cleanLineBreaks}
                onChange={(e) => updateOptions({ cleanLineBreaks: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-slate-700 font-medium">Clean Hyphenation</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.stripHeadersFooters}
                onChange={(e) => updateOptions({ stripHeadersFooters: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-slate-700 font-medium">Filter Headers/Footers</span>
            </label>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.995]'
              : isDragReject
              ? 'border-red-500 bg-red-50/50'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input {...getInputProps()} id="pdf-file-input" />
          <div className="flex flex-col items-center justify-center gap-2">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isDragActive
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              {isConverting ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {isDragActive
                  ? 'Drop PDF documents here to convert'
                  : 'Drag & drop PDF files here, or click to browse'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports single or multi-file uploads • Up to 25 MB per PDF • Processed purely in-memory
              </p>
            </div>
          </div>
        </div>

        {/* Document Queue & Switcher Tabs */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Document Queue ({documents.length})
              </span>
              <span className="text-xs text-slate-400">
                Click any tab to edit & preview
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {documents.map((doc) => {
                const isActive = doc.id === activeDocId;
                const isReady = doc.status === 'ready';
                const isFailed = doc.status === 'error';
                const isWorking = doc.status === 'uploading' || doc.status === 'processing';

                return (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-white border-indigo-600 text-slate-900 shadow-xs ring-1 ring-indigo-600'
                        : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {isReady && <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {isWorking && <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />}
                    {isFailed && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}

                    <div className="flex flex-col text-left max-w-[200px] sm:max-w-[260px]">
                      <span className="font-semibold truncate">{doc.name}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span>{formatBytes(doc.originalSize)}</span>
                        {doc.pageCount > 0 && <span>• {doc.pageCount} pgs</span>}
                        {doc.durationMs && <span>• {doc.durationMs}ms</span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDocument(doc.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                      title="Remove from queue"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
