import { useState } from 'react';
import {
  X,
  Copy,
  Check,
  FolderTree,
  FileCode,
  Layers,
  KeyRound,
  ExternalLink,
  Shield,
  Cpu,
} from 'lucide-react';
import { useConverterStore } from '../store/useConverterStore';
import { toast } from 'sonner';

export default function ArchitectureModal() {
  const { showArchModal, setShowArchModal } = useConverterStore();
  const [activeTab, setActiveTab] = useState<'structure' | 'api-route' | 'ui-components' | 'env-config'>('structure');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!showArchModal) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const directoryStructureCode = `my-pdf-converter/
├── .env.example                     # Cloud parsing API keys & service configs
├── package.json                     # Next.js 15, React 19, Tailwind v4, Zustand, pdf-parse
├── tsconfig.json                    # Strict TypeScript configuration
├── app/
│   ├── layout.tsx                   # Root layout with fonts, providers, toaster
│   ├── page.tsx                     # Main interactive page (Dropzone + Dual-Pane)
│   ├── globals.css                  # Tailwind CSS v4 directives & typography rules
│   └── api/
│       ├── convert/
│       │   └── route.ts             # [DELIVERABLE 2] Next.js Route Handler (Edge/Node)
│       └── health/
│           └── route.ts             # Health check & engine capability probing
├── components/
│   ├── DropzoneArea.tsx             # [DELIVERABLE 3] Drag-and-drop zone with validation
│   ├── DualPaneEditor.tsx           # [DELIVERABLE 3] Monaco/CodeMirror + Live GFM Preview
│   ├── Header.tsx                   # Top navigation, engine switcher, bulk export
│   └── ui/                          # shadcn/ui primitives (Button, Dropdown, Dialog)
├── lib/
│   ├── pdf/
│   │   ├── localParser.ts           # pdf-parse / pdf-lib in-memory text & table extractor
│   │   ├── ocrPipeline.ts           # Multimodal AI vision document layout engine
│   │   └── unstructuredClient.ts    # Unstructured.io / LlamaParse API proxy
│   └── utils.ts                     # Byte formatter, download triggers, zip generator
└── store/
    └── useConverterStore.ts         # Zustand global reactive store (docs, activeDoc, options)`;

  const nextJsRouteHandlerCode = `// app/api/convert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs'; // Node.js runtime for high-throughput stream buffers
export const maxDuration = 60;   // 60s execution window for large PDF documents

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const optionsRaw = formData.get('options') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Missing PDF file in request payload.' },
        { status: 400 }
      );
    }

    // 1. In-Memory Buffer Extraction (Zero-Disk Security)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate %PDF magic header bytes
    if (!buffer.subarray(0, 5).toString('ascii').startsWith('%PDF')) {
      return NextResponse.json(
        { error: 'Corrupt or non-PDF file detected (missing %PDF signature).' },
        { status: 400 }
      );
    }

    const options = optionsRaw ? JSON.parse(optionsRaw) : { mode: 'fast' };
    const startTime = performance.now();

    // 2. Branch: AI Multimodal OCR Layout Pipeline (Gemini 3.8 Flash)
    if (options.mode === 'ocr' && process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: buffer.toString('base64'),
            },
          },
          {
            text: 'Convert this PDF into pristine GitHub Flavored Markdown (GFM). ' +
                  'Preserve all tables (| Col 1 | Col 2 |), headings (#, ##), and reading order. ' +
                  'Output ONLY valid Markdown without backtick wrapper.'
          },
        ],
      });

      return NextResponse.json({
        success: true,
        markdown: response.text?.trim() || '',
        pageCount: 1,
        durationMs: Math.round(performance.now() - startTime),
        modeUsed: 'ocr',
      });
    }

    // 3. Branch: Local Fast AST Parsing (Pure Node.js)
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const textResult = await parser.getText();

    return NextResponse.json({
      success: true,
      markdown: textResult.text || '',
      pageCount: textResult.pages?.length || 1,
      durationMs: Math.round(performance.now() - startTime),
      modeUsed: 'fast',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: \`Processing Failed: \${error.message}\` },
      { status: 500 }
    );
  }
}`;

  const uiImplementationCode = `// components/DualPaneEditor.tsx (Excerpt)
import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useConverterStore } from '@/store/useConverterStore';

export function DualPaneEditor() {
  const { activeDoc, updateMarkdown, syncScroll } = useConverterStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!syncScroll || !editorRef.current || !previewRef.current) return;
    const ratio = editorRef.current.scrollTop / (editorRef.current.scrollHeight - editorRef.current.clientHeight);
    previewRef.current.scrollTop = ratio * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-full divide-x divide-slate-200">
      {/* Left Pane: Raw Markdown Editor */}
      <textarea
        ref={editorRef}
        value={activeDoc?.markdown || ''}
        onChange={(e) => updateMarkdown(e.target.value)}
        onScroll={handleScroll}
        className="w-full h-full p-4 font-mono text-sm leading-6 resize-none outline-none"
      />

      {/* Right Pane: Live GFM Markdown Preview */}
      <div ref={previewRef} className="overflow-y-auto p-8 gfm-preview bg-slate-50/50">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {activeDoc?.markdown || ''}
        </ReactMarkdown>
      </div>
    </div>
  );
}`;

  const envExampleCode = `# Environment Configuration (.env.example)

# Google AI Studio / Gemini API (Used for Multimodal Vision OCR & Complex Tables)
GEMINI_API_KEY="AIzaSy..."

# Cloud Deployment URL
APP_URL="https://your-domain.run.app"

# Optional Cloud PDF Parsers (for enterprise OCR fallback)
UNSTRUCTURED_API_KEY=""
UNSTRUCTURED_API_URL="https://api.unstructuredapp.io/general/v0/general"

# LlamaParse API credentials
LLAMAPARSE_API_KEY=""`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Architectural Deliverables & Next.js 15+ Specifications
              </h2>
              <p className="text-xs text-slate-500">
                Complete system layout, API route handler, component design, and zero-disk privacy guarantees.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowArchModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 border-b border-slate-200 flex space-x-4 bg-white text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('structure')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'structure'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>1. Directory Structure</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('api-route')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'api-route'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>2. Core API Route (`/api/convert`)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ui-components')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'ui-components'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. UI Implementation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('env-config')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'env-config'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>4. Environment Setup</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {activeTab === 'structure' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Clean modular file layout conforming to Next.js 15 App Router and React Server Components:
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(directoryStructureCode, 'dir')}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  {copiedKey === 'dir' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Tree</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto leading-5">
                {directoryStructureCode}
              </pre>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex gap-2">
                  <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800">Zero-Disk Ephemeral Memory</h4>
                    <p className="text-slate-500 mt-0.5">
                      Files are read into memory streams and deallocated immediately upon serialization.
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800">Dual-Engine Routing</h4>
                    <p className="text-slate-500 mt-0.5">
                      Fast local text extraction for plain documents + Multimodal OCR for tables & scans.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api-route' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Production-ready Next.js 15 Route Handler supporting multipart uploads, magic byte validation, and dual-pipeline conversion:
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(nextJsRouteHandlerCode, 'route')}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  {copiedKey === 'route' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Copy route.ts</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto leading-5 max-h-96">
                {nextJsRouteHandlerCode}
              </pre>
            </div>
          )}

          {activeTab === 'ui-components' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Main Dual-Pane Editor component with synchronized scrolling and GFM table support:
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(uiImplementationCode, 'ui')}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  {copiedKey === 'ui' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Copy UI Component</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-cyan-300 rounded-xl text-xs font-mono overflow-x-auto leading-5 max-h-96">
                {uiImplementationCode}
              </pre>
            </div>
          )}

          {activeTab === 'env-config' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Environment variables template (`.env.example`) documenting third-party parsing APIs:
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(envExampleCode, 'env')}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  {copiedKey === 'env' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Copy .env.example</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-amber-300 rounded-xl text-xs font-mono overflow-x-auto leading-5">
                {envExampleCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current Environment: React 19 + Vite + Express (Port 3000) with Next.js App Router parity.
          </span>
          <button
            type="button"
            onClick={() => setShowArchModal(false)}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
