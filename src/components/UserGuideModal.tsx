import { useState } from 'react';
import {
  X,
  BookOpen,
  Zap,
  Sparkles,
  Columns,
  Eye,
  ShieldCheck,
  Download,
  Sliders,
  CheckCircle2,
  FileText,
  Keyboard,
  Github,
  ChevronRight,
  Split,
} from 'lucide-react';
import { useConverterStore } from '../store/useConverterStore';

export default function UserGuideModal() {
  const { showUserGuide, setShowUserGuide, setViewMode } = useConverterStore();
  const [activeSection, setActiveSection] = useState<string>('getting-started');

  if (!showUserGuide) return null;

  const sections = [
    { id: 'getting-started', title: '1. Getting Started', icon: BookOpen },
    { id: 'engines', title: '2. Choosing Engines (Fast vs OCR)', icon: Zap },
    { id: 'pdf-viewer', title: '3. Original PDF Viewer & Compare', icon: Split },
    { id: 'options', title: '4. Conversion Toggles & TOC', icon: Sliders },
    { id: 'editor-tips', title: '5. Editor & Markdown Shortcuts', icon: Keyboard },
    { id: 'privacy', title: '6. Privacy & In-Memory Security', icon: ShieldCheck },
    { id: 'export-github', title: '7. Exporting & GitHub Integration', icon: Github },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">DocuMark User Guide & Manual</h2>
              <p className="text-xs text-slate-500">
                Learn how to convert, inspect, compare, and edit PDFs to Markdown with high fidelity.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowUserGuide(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Column Sidebar + Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-3 space-y-1 overflow-y-auto shrink-0 hidden md:block">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Table of Contents
            </div>
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{section.title}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content Pane */}
          <div className="flex-1 p-6 overflow-y-auto bg-white text-slate-700 text-xs sm:text-sm space-y-6">
            {/* Mobile Category Pill Selector */}
            <div className="md:hidden flex overflow-x-auto gap-1 pb-2 border-b border-slate-100">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSection(s.id)}
                  className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap font-medium ${
                    activeSection === s.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {s.title.split('.')[1] || s.title}
                </button>
              ))}
            </div>

            {/* Section 1: Getting Started */}
            {activeSection === 'getting-started' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Getting Started with DocuMark
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Convert any PDF document into clean, standardized Markdown in seconds.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs mb-2">
                      1
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-1">Upload Your PDF</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Drag & drop any PDF file (up to 25MB) or click the upload zone. You can also click <strong>Load Samples</strong> to test instantly.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs mb-2">
                      2
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-1">Live Dual-Pane Edit</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Edit raw Markdown in the left pane while watching real-time GFM HTML render on the right with synchronized scrolling.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs mb-2">
                      3
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-1">Export & Bundle</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Download individual <code>.md</code> files, copy to clipboard in 1 click, or export an entire queue as a bundled <code>.zip</code> archive.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Engines */}
            {activeSection === 'engines' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    Choosing the Right Conversion Engine
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    DocuMark features a dual-pipeline engine to balance speed and visual accuracy.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span>Fast Text Engine (Local Node.js)</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Extracts embedded PDF text streams directly in-memory via AST parsing without calling external servers.
                    </p>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> <strong>Ultra-fast:</strong> Typically 100-400ms per file
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> <strong>Zero data transfer:</strong> 100% processed locally
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> <strong>Ideal for:</strong> Digital PDFs, eBooks, contracts
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>OCR & AI Vision Engine (Gemini 3.8 Flash)</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Processes document pages visually to reconstruct multi-column layouts, mathematical equations, and dense tables.
                    </p>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium text-amber-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> <strong>Scanned OCR:</strong> Converts photos/scans of paper
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-amber-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> <strong>Complex Tables:</strong> Extracts row/col matrices
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-amber-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> <strong>Reading Order:</strong> Resolves multi-column flow
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Original PDF Viewer */}
            {activeSection === 'pdf-viewer' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Split className="w-5 h-5 text-indigo-600" />
                    Original PDF Viewer & Comparison Modes
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Side-by-side verification: inspect original PDF pages against converted Markdown output.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                    Available View Layouts in Toolbar:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-indigo-600 block mb-1">Compare Mode</span>
                      <p className="text-slate-500">
                        Displays the <strong>Original PDF Viewer</strong> on the left and the <strong>Live Rendered Preview</strong> on the right. Perfect for auditing financial figures, headers, and tables.
                      </p>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-indigo-600 block mb-1">Split Mode</span>
                      <p className="text-slate-500">
                        Displays the <strong>Raw Markdown Editor</strong> on the left and the <strong>Live Preview</strong> on the right with synchronized scrolling.
                      </p>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-indigo-600 block mb-1">Original PDF Only</span>
                      <p className="text-slate-500">
                        Full-width embedded PDF reader with native search, zoom controls, download button, and popout in new tab.
                      </p>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-indigo-600 block mb-1">Editor / Preview Only</span>
                      <p className="text-slate-500">
                        Focus modes for maximum screen real estate when writing, reviewing, or copying formatted Markdown.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('compare');
                        setShowUserGuide(false);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition-colors"
                    >
                      Try Compare Mode Right Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Options & Toggles */}
            {activeSection === 'options' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-600" />
                    Conversion Toggles & Customization
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Fine-tune how text streams and page structures are standardized into Markdown.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 text-xs">Preserve Page Breaks</span>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Inserts a clean horizontal divider and comment (<code>--- Page 2 of 5 ---</code>) between each PDF page, allowing you to trace page boundaries easily.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 text-xs">Auto-Format Tables</span>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Analyzes horizontal tab stops and whitespace columns to format tabular data into GitHub Flavored Markdown (GFM) pipe tables (<code>| Col 1 | Col 2 |</code>).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 text-xs">Generate Table of Contents (TOC)</span>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Scans document headers (<code>#</code>, <code>##</code>, <code>###</code>) and pre-pends an interactive bulleted list with URL anchor links at the top of the Markdown.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 text-xs">Clean Line Breaks & Hyphenation</span>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Joins trailing hyphenated words split across lines (e.g. <code>auto-</code> + <code>mation</code> $\to$ <code>automation</code>) and normalizes paragraph flow.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 text-xs">Filter Headers & Footers</span>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Detects recurring running headers and page number footers (e.g. <code>Page 3 of 10</code>) and strips them to prevent noise in the Markdown flow.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: Editor Tips */}
            {activeSection === 'editor-tips' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-indigo-600" />
                    Editor Shortcuts & Markdown Quick Reference
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Toolbar actions and formatting syntax supported by DocuMark.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-1">Headings & Typography</span>
                    <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                      <li># Title 1</li>
                      <li>## Subtitle 2</li>
                      <li>### Section 3</li>
                      <li>**Bold text**</li>
                      <li>*Italic text*</li>
                      <li>~~Strikethrough~~</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-1">Lists & Checkboxes</span>
                    <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                      <li>- Bullet item</li>
                      <li>1. Numbered item</li>
                      <li>- [ ] Task to do</li>
                      <li>- [x] Completed task</li>
                      <li>&gt; Blockquote citation</li>
                      <li>--- (Divider)</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-1">Code & Tables</span>
                    <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                      <li>`inline_code()`</li>
                      <li>```typescript\nconst x = 1;\n```</li>
                      <li>| Col 1 | Col 2 |</li>
                      <li>| :--- | ---: |</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-1">Search & Replace</span>
                    <p className="text-slate-500 text-xs">
                      Click the <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">Search</kbd> icon in the toolbar to open instant search & replace across the active Markdown.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 6: Privacy */}
            {activeSection === 'privacy' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Privacy & In-Memory Security
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    How DocuMark ensures zero data leaks and strict confidentiality for sensitive files.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <h4 className="font-bold text-emerald-900 mb-1">100% Ephemeral Memory Processing</h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Unlike traditional converter tools that save files to a <code>/tmp</code> folder or database, DocuMark streams uploaded PDF bytes directly into Node.js <code>Buffer</code> memory. Upon completing AST parsing or sending to AI vision, the buffer is garbage-collected. <strong>No PDF files ever touch physical disk storage.</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-1">Magic Byte Verification</span>
                      <p className="text-slate-500">
                        Every uploaded file is checked for the <code>%PDF-</code> magic byte signature, preventing malicious payloads.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-1">Offline Capability</span>
                      <p className="text-slate-500">
                        In Fast Mode, zero external network requests are made. Your documents stay entirely within your private container instance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 7: Export & GitHub */}
            {activeSection === 'export-github' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Github className="w-5 h-5 text-slate-800" />
                    Exporting & GitHub Repository Deployment
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Export your converted files or push the full application source code to GitHub.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200">
                    <h4 className="font-bold text-indigo-950 mb-1 flex items-center gap-2">
                      <Github className="w-4 h-4 text-indigo-700" />
                      Pushing this Project to Your GitHub Account
                    </h4>
                    <p className="text-xs text-indigo-900 leading-relaxed mb-2">
                      In Google AI Studio Build, GitHub integration is native and one-click:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-indigo-900 font-medium">
                      <li>Click the <strong>Settings</strong> icon in the top-right header of Google AI Studio.</li>
                      <li>Select <strong>Export to GitHub</strong> (or <strong>Download as ZIP</strong>).</li>
                      <li>Choose your GitHub organization/account and name your new repository (e.g. <code>documark-pdf-converter</code>).</li>
                      <li>AI Studio commits and pushes the complete TypeScript codebase, Next.js routes, and dependencies automatically!</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                      Exporting Converted Document Files
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 bg-white rounded border border-slate-200">
                        <span className="font-semibold text-slate-800 block">Download .md</span>
                        <p className="text-slate-500 mt-0.5">Exports the active document as a standard GitHub Flavored Markdown file.</p>
                      </div>
                      <div className="p-2.5 bg-white rounded border border-slate-200">
                        <span className="font-semibold text-slate-800 block">Download .txt</span>
                        <p className="text-slate-500 mt-0.5">Exports raw plain text for pasting into prompt windows or notes.</p>
                      </div>
                      <div className="p-2.5 bg-white rounded border border-slate-200">
                        <span className="font-semibold text-slate-800 block">Export Bulk ZIP</span>
                        <p className="text-slate-500 mt-0.5">Bundles all converted documents into an organized, named <code>.zip</code> file.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            DocuMark v2.4 • In-Memory High-Fidelity PDF Pipeline
          </span>
          <button
            type="button"
            onClick={() => setShowUserGuide(false)}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
