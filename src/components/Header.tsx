import { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Code2,
  Download,
  Trash2,
  ChevronDown,
  Sparkles,
  Zap,
  BookOpen,
} from 'lucide-react';
import { useConverterStore } from '../store/useConverterStore';
import { SAMPLE_PRESETS } from '../lib/samples';
import { downloadBulkZip } from '../lib/pdfUtils';
import { toast } from 'sonner';

export default function Header() {
  const {
    documents,
    options,
    clearAll,
    loadSample,
    setShowArchModal,
    setShowUserGuide,
  } = useConverterStore();

  const [samplesOpen, setSamplesOpen] = useState(false);

  const readyDocs = documents.filter((d) => d.status === 'ready' && d.markdown);

  const handleBulkZip = async () => {
    if (readyDocs.length === 0) {
      toast.error('No converted documents ready to export.');
      return;
    }
    toast.promise(downloadBulkZip(readyDocs), {
      loading: 'Bundling Markdown files into .zip archive...',
      success: `Downloaded ${readyDocs.length} converted documents (.zip)!`,
      error: 'Failed to create zip archive.',
    });
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                DocuMark
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                v2.4
              </span>
              {options.mode === 'ocr' ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200">
                  <Sparkles className="w-3 h-3" /> AI OCR Engine
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                  <Zap className="w-3 h-3" /> Fast Local Engine
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Privacy-Focused PDF to Markdown Pipeline & Live Preview
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Privacy badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% In-Memory (Zero Disk Leaks)</span>
          </div>

          {/* Sample PDFs Dropdown */}
          <div className="relative">
            <button
              id="samples-dropdown-btn"
              type="button"
              onClick={() => setSamplesOpen(!samplesOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <span>Load Samples</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {samplesOpen && (
              <div
                className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-left"
                onMouseLeave={() => setSamplesOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Select Preset PDF
                </div>
                {SAMPLE_PRESETS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      loadSample(sample.id);
                      setSamplesOpen(false);
                      toast.success(`Loaded "${sample.title}"`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-indigo-50/70 transition-colors flex flex-col gap-0.5 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>{sample.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-normal">
                        {sample.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-1">
                      {sample.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Guide Button */}
          <button
            id="open-user-guide-btn"
            type="button"
            onClick={() => setShowUserGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">User Guide</span>
          </button>

          {/* Architecture / Next.js Specs Modal Trigger */}
          <button
            id="open-arch-docs-btn"
            type="button"
            onClick={() => setShowArchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Architecture & API</span>
          </button>

          {/* Bulk Download Zip */}
          <button
            id="bulk-export-zip-btn"
            type="button"
            onClick={handleBulkZip}
            disabled={readyDocs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export ZIP</span>
            {readyDocs.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-slate-700 rounded-full text-[10px]">
                {readyDocs.length}
              </span>
            )}
          </button>

          {/* Clear All */}
          {documents.length > 0 && (
            <button
              id="clear-queue-btn"
              type="button"
              onClick={() => {
                if (confirm('Clear all uploaded and converted documents?')) {
                  clearAll();
                  toast.info('Document workspace cleared.');
                }
              }}
              title="Clear all documents"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
