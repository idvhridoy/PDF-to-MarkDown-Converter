import type { ConvertedDocument, SampleDocumentPreset } from '../types';

export const SAMPLE_PRESETS: SampleDocumentPreset[] = [
  {
    id: 'sample-financial',
    title: 'Q3 Financial Performance Report',
    category: 'Financial / Tables',
    description: 'Executive quarterly report with multi-column financial tables, KPI metrics, and variance analysis.',
    pageCount: 3,
    sizeBytes: 412 * 1024,
    badge: 'Multi-column & Tables',
    filename: 'Q3_Financial_Performance_Report.pdf',
  },
  {
    id: 'sample-tech-spec',
    title: 'Cloud Architecture & API Specification',
    category: 'Technical / Architecture',
    description: 'System design document containing API endpoints, JSON payloads, sequence steps, and code snippets.',
    pageCount: 4,
    sizeBytes: 580 * 1024,
    badge: 'Code & Schemas',
    filename: 'Cloud_Architecture_API_Spec.pdf',
  },
  {
    id: 'sample-research',
    title: 'Deep Document Parsing & OCR Whitepaper',
    category: 'Research / Academic',
    description: 'Academic paper detailing multimodal transformer benchmarks, accuracy scores, and citations.',
    pageCount: 5,
    sizeBytes: 820 * 1024,
    badge: 'Academic & Math',
    filename: 'Deep_Document_Parsing_Whitepaper.pdf',
  },
];

export const SAMPLE_MARKDOWN: Record<string, string> = {
  'sample-financial': `# Global Corp - Q3 Financial Performance & Strategic Review

**Reporting Period:** Quarter 3, Fiscal Year 2025  
**Prepared by:** Office of the Chief Financial Officer  
**Classification:** Confidential / Executive Briefing  

---

## 1. Executive Summary

Global Corp delivered another strong quarter of profitable growth, driven by sustained customer adoption of our enterprise platform services and expansion in international markets. Operating cash flow reached record highs, allowing continued capital re-investment into core automation capabilities.

### Key Performance Highlights:
- **Net Revenue:** **$142.8M** (+18.4% YoY vs. Q3 2024)
- **Gross Margin:** **76.2%** (expanded 140 bps sequentially)
- **Operating Income (Non-GAAP):** **$38.4M** (26.9% operating margin)
- **Annual Recurring Revenue (ARR):** **$520.1M** across 4,280 enterprise accounts
- **Net Revenue Retention (NRR):** **119%**

---

## 2. Consolidated Financial Results

The following table summarizes financial metrics for the quarter ended September 30, 2025 compared with prior periods:

| Financial Metric (in USD Millions) | Q3 2024 | Q2 2025 | Q3 2025 | YoY Change (%) | QoQ Change (%) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Subscription Revenue** | $98.2 | $116.5 | $124.7 | +27.0% | +7.0% |
| **Professional Services** | $22.4 | $19.8 | $18.1 | -19.2% | -8.6% |
| **Total Net Revenue** | **$120.6** | **$136.3** | **$142.8** | **+18.4%** | **+4.8%** |
| Cost of Revenue | $31.8 | $33.4 | $34.0 | +6.9% | +1.8% |
| **Gross Profit** | **$88.8** | **$102.9** | **$108.8** | **+22.5%** | **+5.7%** |
| *Gross Margin %* | *73.6%* | *75.5%* | *76.2%* | *+260 bps* | *+70 bps* |
| Research & Development | $28.4 | $32.1 | $33.5 | +18.0% | +4.4% |
| Sales & Marketing | $34.2 | $37.0 | $36.9 | +7.9% | -0.3% |
| General & Administrative | $11.0 | $12.1 | $12.3 | +11.8% | +1.7% |
| **Operating Income** | **$15.2** | **$21.7** | **$26.1** | **+71.7%** | **+20.3%** |

---

## 3. Segment Breakdown & Regional Performance

### Regional Contribution:
- **North America (NA):** 58% of total revenue ($82.8M)
- **Europe, Middle East, Africa (EMEA):** 28% of total revenue ($40.0M)
- **Asia Pacific (APAC):** 14% of total revenue ($20.0M)

> **CFO Note:** *International expansion continues to outpace expectations, particularly in the EMEA region where GDPR-compliant localized compute pods have accelerated sales cycles.*

### Strategic Action Items for Q4:
- [x] Complete SOC 2 Type II audit renewal
- [x] Finalize European data center sovereign cluster rollout
- [ ] Implement automated pipeline analytics dashboard
- [ ] Transition remaining legacy on-premises contracts to Cloud tier
`,

  'sample-tech-spec': `# Document Processing Engine - Architecture & API Specification

**System Version:** 2.4.0-RELEASE  
**Author:** Platform Core Engineering Group  
**Status:** Approved for Implementation  

---

## Table of Contents
- [1. Overview & System Goals](#1-overview--system-goals)
- [2. System Architecture](#2-system-architecture)
- [3. API Endpoints](#3-api-endpoints)
- [4. Security & Privacy Guarantees](#4-security--privacy-guarantees)

---

## 1. Overview & System Goals

The **DocuMark Ingestion Pipeline** provides high-throughput, asynchronous and synchronous conversion of unstructured binary portable document format (PDF) streams into standardized GitHub-Flavored Markdown (GFM).

### Key Architectural Pillars:
1. **Zero-Disk Streaming:** Documents are buffered strictly in ephemeral memory buffers during conversion.
2. **Deterministic Fallbacks:** Dual-pipeline engine with local AST parsing for low-latency plain text, coupled with multimodal LLM OCR for scanned layout reconstruction.
3. **Lossless Table Preservation:** Heuristic tabular boundary calculation maintaining pipe-delimited formatting.

---

## 2. System Architecture

\`\`\`
+------------------+         Multipart POST         +------------------------+
| Client Applet    | -----------------------------> | Next.js / Express Node |
| (React 19 / Vite)|                                | Worker Pipeline        |
+------------------+                                +------------------------+
         |                                                       |
         | Progress polling / SSE                                |
         v                                                       |
+------------------+         Stream Output                       v
| Dual-Pane Monaco | <----------------------------- +------------------------+
| & GFM Renderer   |                                | Local AST / AI OCR     |
+------------------+                                +------------------------+
\`\`\`

---

## 3. API Endpoints

### \`POST /api/convert\`

Converts an uploaded PDF stream into Markdown format.

#### Request Headers:
- \`Content-Type: multipart/form-data\`
- \`Accept: application/json\`

#### Multipart Payload:
- \`file\`: Binary PDF file (Max: 25MB)
- \`options\`: JSON stringified configuration

#### Request Example (\`curl\`):
\`\`\`bash
curl -X POST "https://api.documark.internal/api/convert" \\
  -F "file=@annual-report.pdf;type=application/pdf" \\
  -F "options={\\"mode\\":\\"ocr\\",\\"preservePageBreaks\\":true,\\"includeTOC\\":true}"
\`\`\`

#### Response Schema (\`application/json\`):
\`\`\`json
{
  "success": true,
  "document": {
    "id": "doc_9f83a0bc",
    "filename": "annual-report.pdf",
    "pageCount": 12,
    "sizeBytes": 1420800,
    "durationMs": 842,
    "markdown": "# Annual Report 2025\\n\\n## 1. Introduction...",
    "modeUsed": "ocr"
  }
}
\`\`\`

---

## 4. Security & Privacy Guarantees

* **In-Memory Volatility:** All file processing streams utilize non-persistent byte buffers.
* **No Telemetry Leakage:** Document text content is never logged in application metrics.
* **Header Sanitation:** Filename parameters undergo strict regex sanitization (\`[a-zA-Z0-9._-]\`) to eliminate path traversal vulnerabilities.
`,

  'sample-research': `# Multimodal Transformer Layout Reconstruction in Dense PDFs

**Authors:** Dr. Elena Vance, Marcus Thorne, Ph.D.  
**Affiliation:** Institute for Computational Document Understanding  
**Published:** Journal of Document Analysis, Vol. 14, Issue 2  

---

## Abstract

We present a unified structural parser for complex Portable Document Format (PDF) files containing non-linear layouts, multi-column articles, and nested numerical tables. Traditional optical character recognition (OCR) systems frequently falter when encountering interleaved columnar blocks, resulting in scrambled sentence continuity. Our approach utilizes dual-attention vision-language embeddings to construct an unbroken semantic reading flow prior to Markdown AST serialization.

---

## 1. Introduction & Related Work

Extracting machine-readable structured text from published scientific literature represents an essential bottleneck for automated synthesis and knowledge retrieval systems. Dense PDFs often incorporate:

1. Dynamic 2-column and 3-column page layouts
2. Embedded mathematical equations with superscript notation ($E = mc^2$)
3. High-density data matrices requiring coordinate-level alignment
4. Floating figures with detached caption anchors

### Benchmarking Comparative Accuracy:

| Architecture / Model | BLEU Score (Structure) | Table F1 (%) | Multi-column Accuracy (%) | Processing Latency (ms/page) |
| :--- | :---: | :---: | :---: | :---: |
| **Traditional Rule-based OCR** | 68.4 | 54.2% | 61.8% | **180 ms** |
| **Vision OCR (Heuristic)** | 79.1 | 71.0% | 76.5% | 420 ms |
| **Multimodal LLM (Gemini 3.8)** | **96.8** | **94.7%** | **98.2%** | 650 ms |
| **Hybrid Pipeline (Ours)** | **97.4** | **95.1%** | **98.6%** | 390 ms |

---

## 2. Algorithmic Formulation

Given an input raster stream $\\mathcal{P} \\in \\mathbb{R}^{H \\times W \\times 3}$, we decompose the page into bounding bounding segments $\\{b_i\\}_{i=1}^N$ where each bounding region encapsulates a semantic block:

$$\\mathcal{L}_{reading\\_order} = \\sum_{i=1}^{N-1} \\log P(b_{i+1} \\mid b_1, \\dots, b_i)$$

Through spatial topological sorting, reading order violations are reduced by **87.3%** across scanned and digital PDFs alike.
`,
};

export function createSampleDocument(presetId: string): ConvertedDocument {
  const preset = SAMPLE_PRESETS.find((p) => p.id === presetId) || SAMPLE_PRESETS[0];
  const markdown = SAMPLE_MARKDOWN[presetId] || SAMPLE_MARKDOWN['sample-financial'];

  return {
    id: `sample-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: preset.filename,
    originalSize: preset.sizeBytes,
    pageCount: preset.pageCount,
    markdown,
    rawText: markdown,
    status: 'ready',
    progress: 100,
    currentStep: 'Completed',
    durationMs: 420,
    createdAt: Date.now(),
    modeUsed: 'fast',
  };
}
