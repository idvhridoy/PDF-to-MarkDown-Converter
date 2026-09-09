import { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useConverterStore } from '../store/useConverterStore';
import { formatBytes } from '../lib/pdfUtils';
import { toast } from 'sonner';

interface Props {
  className?: string;
}

export default function OriginalPdfViewer({ className = '' }: Props) {
  const { documents, activeDocId } = useConverterStore();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[0] || null;

  if (!activeDoc) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-400 min-h-[400px] ${className}`}>
        <FileText className="w-10 h-10 mb-2 text-slate-300" />
        <p className="text-sm font-medium">No PDF Selected</p>
        <p className="text-xs text-slate-400 mt-0.5">Select a document from the queue to inspect the original PDF.</p>
      </div>
    );
  }

  const pdfUrl = activeDoc.pdfBlobUrl;

  const handleDownloadOriginal = () => {
    if (!pdfUrl) {
      toast.error('Original PDF binary is not currently loaded.');
      return;
    }
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = activeDoc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloading original "${activeDoc.name}"`);
  };

  return (
    <div
      className={`flex flex-col bg-white border-r border-slate-200 overflow-hidden ${
        isFullScreen ? 'fixed inset-0 z-50 bg-slate-900/90 p-4' : className
      }`}
    >
      {/* Viewer Header */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-xs truncate max-w-[160px] sm:max-w-[220px]">
                {activeDoc.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-medium">
                PDF
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {formatBytes(activeDoc.originalSize)} • {activeDoc.pageCount} {activeDoc.pageCount === 1 ? 'page' : 'pages'}
            </p>
          </div>
        </div>

        {/* Viewer Controls */}
        <div className="flex items-center gap-1.5">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/60 rounded transition-colors"
              title="Open PDF in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={handleDownloadOriginal}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/60 rounded transition-colors"
            title="Download original PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/60 rounded transition-colors"
            title={isFullScreen ? 'Exit full screen' : 'Expand viewer'}
          >
            {isFullScreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 bg-slate-200/80 relative overflow-hidden flex items-center justify-center">
        {pdfUrl ? (
          <object
            data={`${pdfUrl}#zoom=${zoomLevel}`}
            type="application/pdf"
            className="w-full h-full border-0"
          >
            <iframe
              src={`${pdfUrl}#zoom=${zoomLevel}`}
              className="w-full h-full border-0"
              title={`Original PDF: ${activeDoc.name}`}
            >
              <div className="p-8 text-center bg-white text-slate-600">
                <p className="text-sm font-semibold">Your browser cannot inline PDF viewing.</p>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-md"
                >
                  Click to open PDF externally
                </a>
              </div>
            </iframe>
          </object>
        ) : (
          <div className="p-8 text-center max-w-sm bg-white rounded-xl shadow-xs border border-slate-200 m-4">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-800">Original Stream Deferred</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Upload a local PDF above to inspect the original alongside the converted Markdown.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
