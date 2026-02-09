"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PDF_ID = "neuron-book-sample-pdf";

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
 * - If Foxit SDK is loaded via NEXT_PUBLIC_FOXIT_SCRIPT_URL, initializes real viewer
 *   and uses getSelectedTextInfo() / viewer events for page and selection.
 * - Otherwise runs in mock mode: selectable text area + page input + "Request question" button.
 */
export function FoxitPdfViewer({
  pdfUrl,
  onPageChange,
  onSelection,
  onRequestQuestion,
}: FoxitPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [foxitReady, setFoxitReady] = useState(false);
  const [useMock, setUseMock] = useState(true);
  const mockTextRef = useRef<HTMLDivElement>(null);

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

  // Mock: get selection from the mock text div
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

  // Load Foxit SDK from CDN if env is set
  useEffect(() => {
    const scriptUrl =
      typeof process !== "undefined"
        ? (process.env.NEXT_PUBLIC_FOXIT_SCRIPT_URL as string | undefined)
        : undefined;
    if (!scriptUrl || !containerRef.current) {
      setUseMock(true);
      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      // Foxit SDK may expose PDFViewCtrl or PDFUI; init depends on your SDK version.
      const PDFViewCtrl = (window as unknown as { PDFViewCtrl?: unknown }).PDFViewCtrl;
      const PDFUI = (window as unknown as { PDFUI?: unknown }).PDFUI;
      if (PDFViewCtrl || PDFUI) {
        setFoxitReady(true);
        setUseMock(false);
        // Actual init is project-specific (license, lib path). Here we only signal readiness.
        // You would call e.g. PDFViewCtrl.PDFViewer({ jr: { licenseSN, licenseKey } }).init('#id')
        // and openPDFByHttpRangeRequest({ url: pdfUrl }) then attach addViewerEventListener.
      } else {
        setUseMock(true);
      }
    };
    script.onerror = () => setUseMock(true);
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  // When Foxit is ready, we would init here. For now we only support mock.
  useEffect(() => {
    if (!foxitReady || !containerRef.current) return;
    // Placeholder: real init would go here with license from env
    setUseMock(true);
  }, [foxitReady]);

  // Notify parent of page changes (mock)
  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  if (useMock) {
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
          This is a placeholder for the Foxit PDF viewer. To use the real viewer, set
          NEXT_PUBLIC_FOXIT_SCRIPT_URL and NEXT_PUBLIC_FOXIT_LICENSE_KEY and load the Foxit Web SDK.
          <br /><br />
          Active learning means engaging with the material through questions and reflection.
          When you select text and request a question, the backend generates a Socratic question
          to deepen your understanding. Your answers and difficulty ratings update the Neural Trace
          knowledge graph and schedule review.
          <br /><br />
          Select any sentence above and click &quot;Request question (from selection)&quot; to try the flow.
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} id="foxit-pdf-container" className="h-full w-full min-h-[400px]" />
  );
}
