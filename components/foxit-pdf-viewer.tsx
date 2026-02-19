"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// PDF.js worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const PDF_ID = "neuron-book-sample-pdf";
const FOXIT_EMBED_DIV_ID = "foxit-embed-view";

// Inlined by Next.js at build time
const FOXIT_SCRIPT_URL = process.env.NEXT_PUBLIC_FOXIT_SCRIPT_URL as string | undefined;
const FOXIT_CLIENT_ID = (process.env.NEXT_PUBLIC_FOXIT_LICENSE_KEY as string | undefined)?.trim();

declare global {
  interface Window {
    FoxitEmbed?: {
      View: new (opts: { clientId: string; divId: string }) => FoxitEmbedView;
    };
  }
}

interface FoxitEmbedView {
  previewFile: (
    file: { content: string; metaData?: { fileName?: string } },
    options?: {
      embedMode?: string;
      showToolControls?: boolean;
      showLeftHandPanel?: boolean;
      showDownloadPDF?: boolean;
      showPrintPDF?: boolean;
    },
  ) => void;
}

export interface ReaderEvent {
  pdfId: string;
  pageNumber: number;
  selectedText: string;
}

interface FoxitPdfViewerProps {
  pdfUrl: string;
  onPageChange?: (pageNumber: number) => void;
  onSelection?: (event: ReaderEvent) => void;
  onRequestQuestion?: (event: ReaderEvent) => void;
}

/**
 * PDF viewer — clean mode state machine:
 *
 *   "foxit-loading" → fetching Foxit SDK script
 *   "foxit"         → Foxit embed active (cross-origin CDN PDFs)
 *   "react-pdf"     → react-pdf renderer (same-origin / local PDFs — real text selection)
 *   "iframe"        → browser-native iframe fallback (cross-origin, Foxit unavailable)
 *   "mock"          → no pdfUrl provided
 *
 * Priority:
 *   1. Same-origin URL → "react-pdf" (native text selection, page navigation)
 *   2. Cross-origin + Foxit configured → "foxit-loading" → "foxit"
 *   3. Cross-origin + no Foxit (or Foxit failed) → "iframe"
 *   4. No URL → "mock"
 */
export function FoxitPdfViewer({
  pdfUrl,
  onPageChange,
  onSelection,
  onRequestQuestion,
}: FoxitPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedViewRef = useRef<FoxitEmbedView | null>(null);
  const lastEmbedSelectionRef = useRef<string>("");
  /** Selection captured on Request-question button mousedown so the click doesn't clear it */
  const selectionOnButtonDownRef = useRef<string>("");
  /** Skip next click when we already ran on mousedown (avoids double request) */
  const handledByMouseDownRef = useRef(false);
  const mockTextRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<"foxit-loading" | "foxit" | "react-pdf" | "iframe" | "mock">("foxit-loading");
  const [foxitError, setFoxitError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [contextText, setContextText] = useState("");

  // ── URL helpers ───────────────────────────────────────────────────────────
  function resolveUrl(url: string): string {
    if (typeof window === "undefined") return url;
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
  }

  function checkSameOrigin(url: string): boolean {
    if (typeof window === "undefined") return false;
    if (url.startsWith("/")) return true;
    return resolveUrl(url).startsWith(window.location.origin);
  }

  // ── Mode determination ────────────────────────────────────────────────────
  useEffect(() => {
    if (!pdfUrl) { setMode("mock"); return; }

    // Same-origin / local → react-pdf (gives real text selection)
    if (checkSameOrigin(pdfUrl)) {
      setCurrentPage(1);
      setNumPages(null);
      setMode("react-pdf");
      return;
    }

    // Cross-origin without Foxit config → browser iframe
    if (!FOXIT_SCRIPT_URL || !FOXIT_CLIENT_ID) {
      setMode("iframe");
      return;
    }

    // Foxit already loaded
    if (window.FoxitEmbed) { setMode("foxit"); return; }

    // Load Foxit SDK
    setMode("foxit-loading");
    const script = document.createElement("script");
    script.src = FOXIT_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (window.FoxitEmbed) setMode("foxit");
      else {
        setFoxitError("Foxit script loaded but window.FoxitEmbed not found — check your script URL.");
        setMode("iframe");
      }
    };
    script.onerror = () => {
      setFoxitError(`Could not load Foxit SDK from: ${FOXIT_SCRIPT_URL}`);
      setMode("iframe");
    };
    document.body.appendChild(script);
    return () => { script.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl]);

  // ── Init Foxit embed ──────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "foxit" || !containerRef.current || !window.FoxitEmbed || !FOXIT_CLIENT_ID) return;
    const fileName = pdfUrl.split("/").pop()?.split("?")[0] || "document.pdf";
    try {
      const embedView = new window.FoxitEmbed!.View({ clientId: FOXIT_CLIENT_ID, divId: FOXIT_EMBED_DIV_ID });
      embedViewRef.current = embedView;
      embedView.previewFile(
        { content: resolveUrl(pdfUrl), metaData: { fileName } },
        { embedMode: "SIZED_CONTAINER", showToolControls: true, showLeftHandPanel: true, showDownloadPDF: true, showPrintPDF: true },
      );
      setFoxitError(null);
    } catch (e) {
      setFoxitError(e instanceof Error ? e.message : "Foxit embed init failed");
      setMode("iframe");
    }
    return () => { embedViewRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ── postMessage selection capture (Foxit) ─────────────────────────────────
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const d = event?.data;
      if (!d || typeof d !== "object") return;
      const text =
        typeof d.text === "string" ? d.text
        : typeof d.selectedText === "string" ? d.selectedText
        : typeof d.selection === "string" ? d.selection : "";
      if (text.trim()) lastEmbedSelectionRef.current = text.trim();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => { onPageChange?.(currentPage); }, [currentPage, onPageChange]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const emitRequest = useCallback(
    (page: number, selectedText: string) => {
      onSelection?.({ pdfId: PDF_ID, pageNumber: page, selectedText: selectedText.trim() });
      onRequestQuestion?.({ pdfId: PDF_ID, pageNumber: page, selectedText: selectedText.trim() });
    },
    [onSelection, onRequestQuestion],
  );

  /** Sync capture of selection (for mousedown — before click clears it). */
  const captureSelectionSync = useCallback((): string => {
    if (typeof window !== "undefined" && window.getSelection) {
      const s = (window.getSelection()?.toString() ?? "").trim();
      if (s) return s;
    }
    if (iframeRef.current) {
      try {
        const win = iframeRef.current.contentWindow;
        if (win?.getSelection) {
          const s = (win.getSelection()?.toString() ?? "").trim();
          if (s) return s;
        }
      } catch { /* cross-origin */ }
    }
    return "";
  }, []);

  /** Capture selection: ref (from mousedown) → context field → sync selection → clipboard (last, for iframe copy) → postMessage cache */
  const captureSelection = useCallback(async (): Promise<{ text: string; fromSelection: boolean }> => {
    if (selectionOnButtonDownRef.current.trim()) {
      const s = selectionOnButtonDownRef.current.trim();
      selectionOnButtonDownRef.current = "";
      return { text: s, fromSelection: true };
    }
    if (contextText.trim()) return { text: contextText.trim(), fromSelection: false };

    const sync = captureSelectionSync();
    if (sync) return { text: sync, fromSelection: true };

    if (lastEmbedSelectionRef.current) {
      const s = lastEmbedSelectionRef.current;
      lastEmbedSelectionRef.current = "";
      return { text: s, fromSelection: true };
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
      try {
        const clip = (await navigator.clipboard.readText()).trim();
        if (clip) return { text: clip, fromSelection: false };
      } catch { /* permission denied */ }
    }

    return { text: "", fromSelection: false };
  }, [contextText, captureSelectionSync]);

  const handleRequestQuestion = useCallback(async () => {
    const { text: selected, fromSelection } = await captureSelection();
    if (fromSelection && selected) setContextText(selected);
    else if (contextText.trim()) setContextText("");
    emitRequest(currentPage, selected || "");
  }, [captureSelection, contextText, currentPage, emitRequest]);

  const handleRequestQuestionPointerDown = useCallback(
    (e: React.MouseEvent | React.PointerEvent) => {
      e.preventDefault();
      selectionOnButtonDownRef.current = captureSelectionSync();
      handledByMouseDownRef.current = true;
      void handleRequestQuestion();
    },
    [captureSelectionSync, handleRequestQuestion],
  );

  const handleRequestQuestionClick = useCallback(() => {
    if (handledByMouseDownRef.current) {
      handledByMouseDownRef.current = false;
      return;
    }
    void handleRequestQuestion();
  }, [handleRequestQuestion]);

  const handleMockRequest = useCallback(() => {
    const selected = typeof window !== "undefined"
      ? (window.getSelection()?.toString() ?? "").trim() : "";
    emitRequest(currentPage, selected || (mockTextRef.current?.innerText.slice(0, 200) ?? "active learning"));
  }, [currentPage, emitRequest]);

  // ── Shared question bar: paste/type context (feature 1) or copy from PDF then paste (feature 2) ──
  const QuestionBar = () => (
    <div className="flex flex-col gap-2 shrink-0 pt-2">
      <textarea
        rows={2}
        placeholder="Paste or type selected text here for a targeted question (or leave empty for a page-level question)"
        value={contextText}
        onChange={(e) => setContextText(e.target.value)}
        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-400/50 resize-y min-h-[60px]"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onMouseDown={handleRequestQuestionPointerDown}
          onClick={handleRequestQuestionClick}
          className="rounded-lg bg-teal-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-400 transition-colors shrink-0"
        >
          Request question
        </button>
        <span className="text-xs text-gray-500">
          Uses text from the box above, or current selection/clipboard if the box is empty.
        </span>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (mode === "foxit-loading") {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
          <p className="text-sm text-gray-400">Loading PDF viewer…</p>
        </div>
      </div>
    );
  }

  // react-pdf: same-origin PDFs with real text selection + page navigation
  if (mode === "react-pdf") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <div
          ref={pdfContainerRef}
          className="flex-1 min-h-[400px] overflow-auto rounded-2xl border border-white/10 bg-[#525659] select-text"
          style={{ userSelect: "text" }}
        >
          <Document
            file={resolveUrl(pdfUrl)}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            onLoadError={(e) => setFoxitError(e?.message ?? "Failed to load PDF")}
            loading={
              <div className="flex min-h-[400px] items-center justify-center text-white/60 text-sm">
                Loading PDF…
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              width={Math.min(typeof window !== "undefined" ? window.innerWidth - 80 : 800, 800)}
              renderTextLayer
              renderAnnotationLayer
            />
          </Document>
        </div>
        {foxitError && (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-400 border border-amber-500/20">{foxitError}</p>
        )}
        {/* Pagination */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-sm text-white disabled:opacity-40 hover:bg-white/10 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-400">
            Page {currentPage}{numPages != null ? ` of ${numPages}` : ""}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(numPages ?? p, p + 1))}
            disabled={numPages != null && currentPage >= numPages}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-sm text-white disabled:opacity-40 hover:bg-white/10 transition-colors"
          >
            Next →
          </button>
        </div>
        <p className="text-xs text-gray-500">
          <strong>Two ways to get a question:</strong> (1) Select text in the PDF, copy (Ctrl+C), then paste in the box below. (2) Or paste or type in the box below. Then click Request question.
        </p>
        <QuestionBar />
      </div>
    );
  }

  // Foxit embed: cross-origin CDN PDFs
  if (mode === "foxit") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <div
          ref={containerRef}
          id={FOXIT_EMBED_DIV_ID}
          className="h-full min-h-[500px] w-full rounded-2xl border border-white/10"
        />
        <p className="text-xs text-gray-500">
          <strong>Two ways:</strong> (1) Highlight text in the PDF, copy (Ctrl+C), paste in the box below. (2) Or paste or type in the box below. Then click Request question (or click without pasting for a page-level question).
        </p>
        <QuestionBar />
      </div>
    );
  }

  // iframe: cross-origin fallback when Foxit is unavailable (no warning — silent fallback)
  if (mode === "iframe") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <iframe
          ref={iframeRef}
          src={resolveUrl(pdfUrl)}
          title="PDF viewer"
          className="h-full min-h-[500px] w-full rounded-2xl border border-white/10"
        />
        <p className="text-xs text-gray-500">
          <strong>Two ways:</strong> (1) Highlight text in the PDF, copy (Ctrl+C), then paste in the box below. (2) Or paste or type in the box below. Then click Request question (or click without pasting for a page-level question).
        </p>
        <QuestionBar />
      </div>
    );
  }

  // mock: no pdfUrl
  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-white">Page</label>
        <input
          type="number"
          min={1}
          value={currentPage}
          onChange={(e) => setCurrentPage(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="w-20 rounded-lg border border-white/20 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none focus:border-teal-400/50"
        />
        <button
          type="button"
          onClick={handleMockRequest}
          className="rounded-lg bg-teal-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-400 transition-colors"
        >
          Request question (from selection)
        </button>
      </div>
      <p className="text-xs text-gray-500">
        No PDF provided. Open a textbook from the{" "}
        <a href="/library" className="text-teal-400 hover:underline">Library</a> to read it here.
      </p>
      <div
        ref={mockTextRef}
        className="min-h-[320px] flex-1 select-text rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-gray-300"
        style={{ userSelect: "text" }}
      >
        <strong className="text-white">NeuronBook — Active reading</strong>
        <br /><br />
        Select any text in this area and click &quot;Request question (from selection)&quot; to
        try the Socratic question flow. In a real session, this panel is replaced by your actual
        PDF loaded from the Library.
        <br /><br />
        Active learning means engaging with the material through questions and reflection.
        When you select text and request a question, the backend generates a Socratic question
        to deepen your understanding.
      </div>
    </div>
  );
}
