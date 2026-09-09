import { useState, useRef, useEffect, useMemo, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  Download,
  Search,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Table as TableIcon,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Link as LinkIcon,
  ArrowLeftRight,
  Eye,
  Edit3,
  Columns,
  Clock,
  Type,
  FileCode,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useConverterStore } from '../store/useConverterStore';
import { downloadFile, calculateReadTime } from '../lib/pdfUtils';
import { toast } from 'sonner';

export default function DualPaneEditor() {
  const {
    documents,
    activeDocId,
    viewMode,
    syncScroll,
    updateActiveMarkdown,
    setViewMode,
    setSyncScroll,
  } = useConverterStore();

  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === activeDocId) || documents[0] || null;
  }, [documents, activeDocId]);

  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingSync = useRef(false);

  const markdown = activeDoc?.markdown || '';

  // Synchronized scrolling handler
  const handleEditorScroll = () => {
    if (!syncScroll || isScrollingSync.current) return;
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    isScrollingSync.current = true;
    const scrollPercentage =
      editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
    preview.scrollTop =
      scrollPercentage * (preview.scrollHeight - preview.clientHeight);
    setTimeout(() => {
      isScrollingSync.current = false;
    }, 50);
  };

  const handlePreviewScroll = () => {
    if (!syncScroll || isScrollingSync.current) return;
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    isScrollingSync.current = true;
    const scrollPercentage =
      preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1);
    editor.scrollTop =
      scrollPercentage * (editor.scrollHeight - editor.clientHeight);
    setTimeout(() => {
      isScrollingSync.current = false;
    }, 50);
  };

  // Text insertion helper for toolbar
  const insertText = (before: string, after = '', defaultText = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end) || defaultText;

    const replacement = `${before}${selectedText}${after}`;
    const newVal =
      currentVal.substring(0, start) + replacement + currentVal.substring(end);

    updateActiveMarkdown(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 10);
  };

  const handleCopy = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      toast.success('Markdown copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy text.');
    }
  };

  const handleDownloadSingle = () => {
    if (!activeDoc || !markdown) return;
    const baseName = activeDoc.name.replace(/\.[^/.]+$/, '');
    downloadFile(markdown, `${baseName}.md`);
    toast.success(`Downloaded ${baseName}.md`);
  };

  const handleDownloadTxt = () => {
    if (!activeDoc || !markdown) return;
    const baseName = activeDoc.name.replace(/\.[^/.]+$/, '');
    downloadFile(markdown, `${baseName}.txt`, 'text/plain;charset=utf-8');
    toast.success(`Downloaded ${baseName}.txt`);
  };

  // Search & Replace
  const handleReplaceAll = () => {
    if (!searchQuery) return;
    const occurrences = (markdown.match(new RegExp(searchQuery, 'gi')) || []).length;
    if (occurrences === 0) {
      toast.info('No matches found to replace.');
      return;
    }
    const updated = markdown.replaceAll(searchQuery, replaceQuery);
    updateActiveMarkdown(updated);
    toast.success(`Replaced ${occurrences} occurrences of "${searchQuery}".`);
  };

  // Text statistics
  const stats = useMemo(() => {
    const text = markdown.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const lines = text ? text.split('\n').length : 0;
    const readTime = calculateReadTime(text);
    return { words, chars, lines, readTime };
  }, [markdown]);

  // Line numbers generation
  const lineNumbers = useMemo(() => {
    const count = Math.max(1, stats.lines);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [stats.lines]);

  if (!activeDoc) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 min-h-[400px]">
        <FileCode className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="text-base font-semibold text-slate-700">No Document Selected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Upload a PDF above or choose from one of the quick test presets to open the dual-pane editor.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden min-h-[600px]">
      {/* Top Action & View Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Document Title & Status */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-slate-800 text-sm truncate max-w-[200px] sm:max-w-xs">
            {activeDoc.name}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium border border-slate-200">
            {activeDoc.pageCount} {activeDoc.pageCount === 1 ? 'page' : 'pages'}
          </span>
        </div>

        {/* View Mode Controls & Sync Scroll */}
        <div className="flex items-center gap-2">
          {/* Synchronized Scroll Toggle */}
          <button
            id="toggle-sync-scroll-btn"
            type="button"
            onClick={() => setSyncScroll(!syncScroll)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              syncScroll
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            title="Synchronized scrolling between editor and preview"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync Scroll</span>
          </button>

          {/* View Mode Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
            <button
              id="view-editor-only-btn"
              type="button"
              onClick={() => setViewMode('editor')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Editor Only"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id="view-split-btn"
              type="button"
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Split View"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              id="view-preview-only-btn"
              type="button"
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Preview Only"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-1.5">
            <button
              id="copy-markdown-btn"
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              id="download-md-btn"
              type="button"
              onClick={handleDownloadSingle}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Formatting Toolbar */}
      {(viewMode === 'split' || viewMode === 'editor') && (
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-slate-600">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => insertText('# ', '', 'Heading 1')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText('## ', '', 'Heading 2')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText('### ', '', 'Heading 3')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={() => insertText('**', '**', 'bold text')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText('*', '*', 'italic text')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText('~~', '~~', 'strikethrough')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={() => insertText('`', '`', 'code')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText('```typescript\n', '\n```', '// Your code here')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Code Block"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                insertText(
                  '| Header 1 | Header 2 | Header 3 |\n| :--- | :---: | ---: |\n| Item 1 | Value A | 100 |\n| Item 2 | Value B | 200 |\n\n'
                )
              }
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Insert Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={() => insertText('- ', '', 'List item')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText('1. ', '', 'Numbered item')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Ordered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText('- [ ] ', '', 'Task to do')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Task Checkbox"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={() => insertText('> ', '', 'Quote citation')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText('[Link Title](', ')', 'https://example.com')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Hyperlink"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText('\n\n---\n\n')}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
              title="Page Break / Divider"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search & Replace Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              className={`p-1.5 rounded transition-colors ${
                showSearch
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'hover:bg-slate-200 text-slate-600'
              }`}
              title="Search & Replace"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Replace Box */}
      {showSearch && (viewMode === 'split' || viewMode === 'editor') && (
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded px-2 py-1">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Find in Markdown..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none text-xs w-36 sm:w-48 text-slate-800"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded px-2 py-1">
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="outline-none text-xs w-36 sm:w-48 text-slate-800"
            />
          </div>
          <button
            type="button"
            onClick={handleReplaceAll}
            disabled={!searchQuery}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium disabled:opacity-40"
          >
            Replace All
          </button>
        </div>
      )}

      {/* Main Dual-Pane Content Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Markdown Raw Editor */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            className={`flex flex-col bg-white border-r border-slate-200 overflow-hidden ${
              viewMode === 'split' ? 'w-full lg:w-1/2' : 'w-full'
            }`}
          >
            <div className="bg-slate-50 px-4 py-1.5 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Raw Markdown Source</span>
              <span className="font-normal text-[11px] text-slate-400">
                UTF-8 • Standard GFM
              </span>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Line Numbers column */}
              <div className="w-12 bg-slate-50 py-3 pr-2 select-none text-right font-mono text-[11px] text-slate-400 border-r border-slate-200 overflow-hidden hidden sm:block">
                {lineNumbers.map((num) => (
                  <div key={num} className="leading-6">
                    {num}
                  </div>
                ))}
              </div>

              {/* Text Area */}
              <textarea
                ref={editorRef}
                id="raw-markdown-editor"
                value={markdown}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  updateActiveMarkdown(e.target.value)
                }
                onScroll={handleEditorScroll}
                placeholder="Converted Markdown will appear here. You can edit directly..."
                className="flex-1 p-3 outline-none resize-none font-mono text-xs sm:text-sm leading-6 text-slate-800 bg-white overflow-y-auto"
                spellCheck="false"
              />
            </div>

            {/* Bottom Editor Stats Bar */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span>{stats.words.toLocaleString()} words</span>
                <span>•</span>
                <span>{stats.chars.toLocaleString()} characters</span>
                <span>•</span>
                <span>{stats.lines} lines</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>~{stats.readTime} min read</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Pane: Live Rendered Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            ref={previewRef}
            onScroll={handlePreviewScroll}
            className={`flex-1 flex flex-col bg-slate-50/70 overflow-y-auto ${
              viewMode === 'preview' ? 'w-full' : ''
            }`}
          >
            <div className="bg-slate-50 px-4 py-1.5 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 z-10 flex items-center justify-between">
              <span>Live HTML / GFM Preview</span>
              <span className="font-normal text-[11px] text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Real-time Sync
              </span>
            </div>

            <div className="p-6 sm:p-10 max-w-4xl mx-auto w-full bg-white my-4 sm:my-6 rounded-xl shadow-xs border border-slate-200 gfm-preview min-h-[500px]">
              {markdown ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom Code Block Renderer with Copy Button
                    pre: ({ children, ...props }) => {
                      return (
                        <div className="relative group my-4">
                          <pre {...props}>{children}</pre>
                        </div>
                      );
                    },
                    code: ({ children, ...props }) => {
                      return <code {...props}>{children}</code>;
                    },
                    // Custom Table container for responsive horizontal scrolling
                    table: ({ children, ...props }) => {
                      return (
                        <div className="overflow-x-auto my-4 rounded-lg border border-slate-200">
                          <table className="w-full text-left" {...props}>
                            {children}
                          </table>
                        </div>
                      );
                    },
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              ) : (
                <div className="text-center py-20 text-slate-400 text-sm">
                  Waiting for Markdown content...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
