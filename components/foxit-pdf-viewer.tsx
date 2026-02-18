"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PDF_ID = "neuron-book-sample-pdf";
const FOXIT_EMBED_DIV_ID = "foxit-embed-view";

// Inlined by Next.js at build time for NEXT_PUBLIC_ vars
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
 * PDF viewer with a clean mode state machine:
 *   "foxit-loading" → loading Foxit SDK script
 *   "foxit"         → Foxit embed initialized and showing
 *   "iframe"        → native browser PDF iframe (fallback for any reason)
 *   "mock"          → no PDF URL available, show sample text
 *
 * Priority:
 *   1. If Foxit keys configured AND pdfUrl is NOT same-origin → try Foxit embed
 *   2. Fallback (Foxit missing/failed, OR local/same-origin URL) → iframe with pdfUrl
 *   3. No pdfUrl → mock text
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
  const mockTextRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [mode, setMode] = useState<"foxit-loading" | "foxit" | "iframe" | "mock">("foxit-loading");
  const [foxitError, setFoxitError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [contextText, setContextText] = useState("");

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

  // ── Mode determination (runs once on mount, and when pdfUrl changes) ──────
  useEffect(() => {
    if (!pdfUrl) {
      setMode("mock");
      return;
    }

    // Local / same-origin PDFs: always use iframe directly
    // (Foxit cloud viewer can't reach localhost URLs)
    if (checkSameOrigin(pdfUrl)) {
      setMode("iframe");
      return;
    }

    // No Foxit credentials configured → iframe fallback
    if (!FOXIT_SCRIPT_URL || !FOXIT_CLIENT_ID) {
      setMode("iframe");
      return;
    }

    // Foxit SDK already loaded from a previous mount → go straight to foxit mode
    if (window.FoxitEmbed) {
      setMode("foxit");
      return;
    }

    // Load Foxit SDK script
    setMode("foxit-loading");
    const script = document.createElement("script");
    script.src = FOXIT_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      if (window.FoxitEmbed) {
        setMode("foxit");
      } else {
        setFoxitError("Foxit script loaded but window.FoxitEmbed was not found — check your script URL.");
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

  // ── Init Foxit embed when mode becomes "foxit" ────────────────────────────
  useEffect(() => {
    if (mode !== "foxit" || !containerRef.current || !window.FoxitEmbed || !FOXIT_CLIENT_ID) return;

    const fileName = pdfUrl.split("/").pop()?.split("?")[0] || "document.pdf";

    try {
      const embedView = new window.FoxitEmbed!.View({
        clientId: FOXIT_CLIENT_ID,
        divId: FOXIT_EMBED_DIV_ID,
      });
      embedViewRef.current = embedView;
      embedView.previewFile(
        { content: resolveUrl(pdfUrl), metaData: { fileName } },
        {
          embedMode: "SIZED_CONTAINER",
          showToolControls: true,
          showLeftHandPanel: true,
          showDownloadPDF: true,
          showPrintPDF: true,
        },
      );
      setFoxitError(null);
    } catch (e) {
      setFoxitError(e instanceof Error ? e.message : "Foxit embed init failed");
      setMode("iframe");
    }

    return () => { embedViewRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ── postMessage selection capture ─────────────────────────────────────────
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const d = event?.data;
      if (!d || typeof d !== "object") return;
      const text =
        typeof d.text === "string" ? d.text
        : typeof d.selectedText === "string" ? d.selectedText
        : typeof d.selection === "string" ? d.selection
        : "";
      if (text.trim()) lastEmbedSelectionRef.current = text.trim();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => { onPageChange?.(currentPage); }, [currentPage, onPageChange]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const emitRequest = useCallback(
    (page: number, selectedText: string) => {
      const event: ReaderEvent = { pdfId: PDF_ID, pageNumber: page, selectedText: selectedText.trim() };
      onSelection?.(event);
      onRequestQuestion?.(event);
    },
    [onSelection, onRequestQuestion],
  );

  const captureSelection = useCallback((): string => {
    if (contextText.trim()) return contextText.trim();
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
    if (lastEmbedSelectionRef.current) {
      const s = lastEmbedSelectionRef.current;
      lastEmbedSelectionRef.current = "";
      return s;
    }
    return "";
  }, [contextText]);

  const handleRequestQuestion = useCallback(() => {
    const selected = captureSelection();
    if (contextText.trim()) setContextText("");
    emitRequest(currentPage, selected || "");
  }, [captureSelection, contextText, currentPage, emitRequest]);

  const handleMockRequest = useCallback(() => {
    const selected = typeof window !== "undefined"
      ? (window.getSelection()?.toString() ?? "").trim()
      : "";
    emitRequest(
      currentPage,
      selected || (mockTextRef.current?.innerText.slice(0, 200) ?? "active learning"),
    );
  }, [currentPage, emitRequest]);

  // ── Shared question bar ───────────────────────────────────────────────────
  const QuestionBar = () => (
    <div className="flex flex-col gap-2 pt-2">
      <input
        type="text"
        placeholder="Optional: paste highlighted text for a targeted question"
        value={contextText}
        onChange={(e) => setContextText(e.target.value)}
        className="w-full rounded border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleRequestQuestion}
          className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Request question
        </button>
        <span className="text-xs text-muted-foreground">
          Highlight text in the PDF, paste it above, then click — or just click for a page-level question.
        </span>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (mode === "foxit-loading") {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center rounded-lg border border-border bg-muted/30">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading PDF viewer…</p>
        </div>
      </div>
    );
  }

  if (mode === "foxit") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <div
          ref={containerRef}
          id={FOXIT_EMBED_DIV_ID}
          className="h-full min-h-[500px] w-full rounded-lg border border-border"
        />
        <QuestionBar />
      </div>
    );
  }

  if (mode === "iframe") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        {foxitError && (
          <p className="rounded bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
            Foxit viewer unavailable: {foxitError} — using browser PDF viewer as fallback.
          </p>
        )}
        <iframe
          ref={iframeRef}
          src={resolveUrl(pdfUrl)}
          title="PDF viewer"
          className="h-full min-h-[500px] w-full rounded-lg border border-border"
        />
        <QuestionBar />
      </div>
    );
  }

  // "mock" — no pdfUrl provided
  return (
    <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Page</label>
        <input
          type="number"
          min={1}
          value={currentPage}
          onChange={(e) => setCurrentPage(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="w-20 rounded border border-input bg-background px-2 py-1 text-sm"
        />
        <button
          type="button"
          onClick={handleMockRequest}
          className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Request question (from selection)
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        No PDF provided. Open a textbook from the{" "}
        <a href="/library" className="underline">Library</a> to read it here.
      </p>
      <div
        ref={mockTextRef}
        className="min-h-[320px] flex-1 select-text rounded border border-border bg-background p-4 text-sm leading-relaxed"
        style={{ userSelect: "text" }}
      >
        <strong>NeuronBook — Active reading</strong>
        <br />
        <br />
        Select any text in this area and click &quot;Request question (from selection)&quot; to
        try the Socratic question flow. In a real session, this panel is replaced by your actual
        PDF loaded from the Library.
        <br />
        <br />
        Active learning means engaging with the material through questions and reflection.
        When you select text and request a question, the backend generates a Socratic question
        to deepen your understanding.
      </div>
    </div>
  );
}
