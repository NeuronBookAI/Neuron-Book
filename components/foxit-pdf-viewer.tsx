"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// PDF.js worker (same module as Document/Page usage per react-pdf docs)
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const PDF_ID = "neuron-book-sample-pdf";
const FOXIT_EMBED_DIV_ID = "foxit-embed-view";

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
    options?: { embedMode?: string; showToolControls?: boolean; showLeftHandPanel?: boolean; showDownloadPDF?: boolean; showPrintPDF?: boolean }
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
 * Foxit PDF viewer container.
 * - If NEXT_PUBLIC_FOXIT_SCRIPT_URL and NEXT_PUBLIC_FOXIT_LICENSE_KEY are set,
 *   loads Foxit Embed SDK and shows the real PDF viewer.
 * - Otherwise runs in mock mode: selectable text area + page input + "Request question" button.
 */
export function FoxitPdfViewer({
  pdfUrl,
  onPageChange,
  onSelection,
  onRequestQuestion,
}: FoxitPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedViewRef = useRef<FoxitEmbedView | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [foxitReady, setFoxitReady] = useState(false);
  const [useMock, setUseMock] = useState(true);
  const [foxitError, setFoxitError] = useState<string | null>(null);
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  const [useLocalIframe, setUseLocalIframe] = useState(false);
  const [contextText, setContextText] = useState("");
  const [numPages, setNumPages] = useState<number | null>(null);
  const lastEmbedSelectionRef = useRef<string>("");
  const mockTextRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const emitRequest = useCallback(
    (page: number, selectedText: string) => {
      const event: ReaderEvent = {
        pdfId: PDF_ID,
        pageNumber: page,
        selectedText: selectedText.trim(),
      };
      onSelection?.(event);
      onRequestQuestion?.(event);
    },
    [onSelection, onRequestQuestion]
  );

  const handleMockRequestQuestion = useCallback(() => {
    let selected = "";
    if (typeof window !== "undefined" && window.getSelection) {
      const sel = window.getSelection();
      selected = (sel?.toString() ?? "").trim();
    }
    if (!selected && mockTextRef.current) {
      selected = mockTextRef.current.innerText.slice(0, 200);
    }
    emitRequest(currentPage, selected || "active learning");
  }, [currentPage, emitRequest]);

  /** Get selection from in-page PDF (react-pdf): just use getSelection(). */
  const handleRequestQuestionFromSelection = useCallback(() => {
    const fromContext = contextText.trim();
    if (fromContext) {
      emitRequest(currentPage, fromContext);
      setContextText("");
      return;
    }
    let selected = "";
    if (typeof window !== "undefined" && window.getSelection) {
      selected = (window.getSelection()?.toString() ?? "").trim();
    }
    emitRequest(currentPage, selected || "");
  }, [currentPage, contextText, emitRequest]);

  /** Get current selection: context field, clipboard, postMessage from embed, or iframe getSelection (when not using react-pdf). */
  const handleRequestQuestionWithSelection = useCallback(async () => {
    const fromContext = contextText.trim();
    if (fromContext) {
      emitRequest(currentPage, fromContext);
      setContextText("");
      return;
    }
    let selected = "";
    if (typeof window !== "undefined" && window.getSelection) {
      selected = (window.getSelection()?.toString() ?? "").trim();
    }
    if (!selected && iframeRef.current) {
      try {
        const win = iframeRef.current.contentWindow;
        const doc = iframeRef.current.contentDocument;
        if (win?.getSelection) selected = (win.getSelection()?.toString() ?? "").trim();
        else if (doc?.getSelection) selected = (doc.getSelection()?.toString() ?? "").trim();
      } catch {
        // cross-origin or no access
      }
    }
    if (!selected && typeof navigator !== "undefined" && navigator.clipboard?.readText) {
      try {
        const clip = await navigator.clipboard.readText();
        selected = (clip ?? "").trim();
      } catch {
        // permission denied or clipboard empty
      }
    }
    if (!selected && lastEmbedSelectionRef.current) {
      selected = lastEmbedSelectionRef.current.trim();
      lastEmbedSelectionRef.current = "";
    }
    if (!selected && containerRef.current) {
      const iframes = containerRef.current.querySelectorAll("iframe");
      for (const iframe of iframes) {
        try {
          const w = (iframe as HTMLIFrameElement).contentWindow;
          if (w?.getSelection) {
            const t = (w.getSelection()?.toString() ?? "").trim();
            if (t) {
              selected = t;
              break;
            }
          }
        } catch {
          // cross-origin
        }
      }
    }
    emitRequest(currentPage, selected || "");
  }, [currentPage, contextText, emitRequest]);

  // Load Foxit Embed SDK script
  useEffect(() => {
    const scriptUrl =
      typeof process !== "undefined"
        ? (process.env.NEXT_PUBLIC_FOXIT_SCRIPT_URL as string | undefined)
        : undefined;
    const clientId =
      typeof process !== "undefined"
        ? (process.env.NEXT_PUBLIC_FOXIT_LICENSE_KEY as string | undefined)
        : undefined;

    if (!scriptUrl || !clientId?.trim()) {
      setUseMock(true);
      return;
    }

    if ((window as Window).FoxitEmbed) {
      setFoxitReady(true);
      setUseMock(false);
      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      if ((window as Window).FoxitEmbed) {
        setFoxitReady(true);
        setUseMock(false);
      } else {
        setFoxitError("Foxit script loaded but FoxitEmbed not found");
        setUseMock(true);
      }
    };
    script.onerror = () => {
      setFoxitError("Failed to load Foxit script");
      setUseMock(true);
    };
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  // For PDFs in public/ (same-origin), use iframe so the file loads without Foxit cloud (which can't fetch localhost)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const full =
      pdfUrl.startsWith("http") || pdfUrl.startsWith("blob:")
        ? pdfUrl
        : `${window.location.origin}${pdfUrl.startsWith("/") ? pdfUrl : `/${pdfUrl}`}`;
    const same =
      pdfUrl.startsWith("/") || full.startsWith(window.location.origin);
    if (same) {
      setLocalPdfUrl(full);
      setUseLocalIframe(true);
      setUseMock(false);
      setFoxitError(null);
    }
  }, [pdfUrl]);

  // If Foxit embed sends selection via postMessage, capture it (future-proof)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const d = event?.data;
      if (!d || typeof d !== "object") return;
      const text =
        typeof d.text === "string"
          ? d.text
          : typeof d.selectedText === "string"
            ? d.selectedText
            : typeof d.selection === "string"
              ? d.selection
              : "";
      if (text.trim()) lastEmbedSelectionRef.current = text.trim();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Init Foxit Embed viewer when ready and container is mounted (skip when using local iframe)
  useEffect(() => {
    if (useLocalIframe || !foxitReady || !containerRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_FOXIT_LICENSE_KEY?.trim();
    if (!clientId || !window.FoxitEmbed) return;

    const fileName = pdfUrl.split("/").pop() || "document.pdf";
    const fullPdfUrl =
      pdfUrl.startsWith("http") || pdfUrl.startsWith("blob:")
        ? pdfUrl
        : `${typeof window !== "undefined" ? window.location.origin : ""}${pdfUrl}`;

    const loadPdf = (content: string) => {
      try {
        const embedView = new window.FoxitEmbed!.View({
          clientId,
          divId: FOXIT_EMBED_DIV_ID,
        });
        embedViewRef.current = embedView;
        embedView.previewFile(
          {
            content,
            metaData: { fileName },
          },
          {
            embedMode: "SIZED_CONTAINER",
            showToolControls: true,
            showLeftHandPanel: true,
            showDownloadPDF: true,
            showPrintPDF: true,
          }
        );
        setFoxitError(null);
      } catch (e) {
        setFoxitError(e instanceof Error ? e.message : "Foxit init failed");
        setUseMock(true);
      }
    };
    loadPdf(fullPdfUrl);

    return () => {
      embedViewRef.current = null;
    };
  }, [foxitReady, pdfUrl, useLocalIframe]);

  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  if (useLocalIframe && localPdfUrl) {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <div
          ref={pdfContainerRef}
          className="flex-1 min-h-[400px] overflow-auto rounded-lg border border-border bg-[#525659]"
        >
          <Document
            file={localPdfUrl}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            onLoadError={(e) => setFoxitError(e?.message ?? "Failed to load PDF")}
            loading={
              <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">
                Loading PDF…
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              width={Math.min(typeof window !== "undefined" ? window.innerWidth - 48 : 800, 800)}
              renderTextLayer
              renderAnnotationLayer
            />
          </Document>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="rounded border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} {numPages != null ? `of ${numPages}` : ""}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(numPages ?? p, p + 1))}
              disabled={numPages != null && currentPage >= numPages}
              className="rounded border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <input
            type="text"
            placeholder="Or paste text here to ask about it"
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            className="flex-1 min-w-[200px] rounded border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={handleRequestQuestionFromSelection}
            className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Request question (current page)
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Select text in the PDF above, then click &quot;Request question&quot; — no copy/paste needed.
        </p>
      </div>
    );
  }

  if (useMock) {
    return (
      <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
        {foxitError && (
          <p className="text-xs text-amber-600 dark:text-amber-400">{foxitError}</p>
        )}
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
            onClick={handleMockRequestQuestion}
            className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Request question (from selection)
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Select text below and click &quot;Request question&quot;, or use the button to use sample context.
        </p>
        <div
          ref={mockTextRef}
          className="min-h-[320px] flex-1 select-text rounded border border-border bg-background p-4 text-sm leading-relaxed"
          style={{ userSelect: "text" }}
        >
          <strong>NeuronBook — Active reading (mock PDF)</strong>
          <br /><br />
          Set NEXT_PUBLIC_FOXIT_SCRIPT_URL and NEXT_PUBLIC_FOXIT_LICENSE_KEY to load the real Foxit viewer.
          <br /><br />
          Active learning means engaging with the material through questions and reflection.
          When you select text and request a question, the backend generates a Socratic question
          to deepen your understanding.
          <br /><br />
          Select any sentence above and click &quot;Request question (from selection)&quot; to try the flow.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div
        ref={containerRef}
        id={FOXIT_EMBED_DIV_ID}
        className="h-full min-h-[500px] w-full rounded-lg border border-border"
      />
      <div className="flex flex-col gap-2">
        <div>
          <label htmlFor="foxit-context" className="mb-1 block text-xs font-medium text-muted-foreground">
            Highlight in PDF → copy (Ctrl+C) → paste here, or we'll use clipboard when you click the button
          </label>
          <input
            id="foxit-context"
            type="text"
            placeholder="Paste your selection here (or leave empty and we'll try clipboard)"
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleRequestQuestionWithSelection()}
            className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Request question (current page)
          </button>
          <span className="text-xs text-muted-foreground">
            With selection in the box above (or in clipboard) → question about that text. Empty → question varies by page.
          </span>
        </div>
      </div>
    </div>
  );
}
