"use client";

/**
 * Reader page — part of the main app (dashboard) frontend.
 * Accepts ?url and ?title search params to open a specific Sanity PDF.
 * Falls back to NEXT_PUBLIC_SAMPLE_PDF_URL or the bundled sample PDF.
 * Backend: Flask /api/question/generate and /api/answer/submit (Foxit + You.com).
 */
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { FoxitPdfViewer } from "@/components/foxit-pdf-viewer";
import SocraticPopUpIntegrated from "@/components/ui/SocraticPopUpIntegrated";
import type { ReaderEvent } from "@/components/foxit-pdf-viewer";

const FALLBACK_PDF_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SAMPLE_PDF_URL) || "/Lecture1_modified_JG.pdf";

export default function ReaderPage() {
  const [currentEvent, setCurrentEvent] = useState<ReaderEvent | null>(null);

  const handleRequestQuestion = useCallback((event: ReaderEvent) => {
    console.log('Question requested:', event);
    setCurrentEvent(event);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="border-b border-border px-4 py-2">
        <h1 className="text-lg font-semibold">NeuronBook — Reader (Enhanced with Embeddings)</h1>
      </header>
      <div className="flex flex-1 min-h-0">
        <main className="flex-1 overflow-auto p-4">
          <FoxitPdfViewer
            pdfUrl={SAMPLE_PDF_URL}
            onRequestQuestion={handleRequestQuestion}
          />
        </main>
        <aside className="w-[400px] shrink-0 border-l border-border bg-muted/20 flex flex-col overflow-y-auto">
          {currentEvent ? (
            <SocraticPopUpIntegrated
              event={currentEvent}
              onClose={() => setCurrentEvent(null)}
              onAnswerSubmitted={() => {
                console.log('Answer submitted!');
                // Optionally clear event to hide popup
                // setCurrentEvent(null);
              }}
            />
          ) : (
            <div className="p-6 text-center">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Socratic Questions</h2>
              <p className="text-sm text-muted-foreground">
                Select text in the PDF and click "Request question" to get started with AI-enhanced questions using embeddings.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}