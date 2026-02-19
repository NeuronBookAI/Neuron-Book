"use client";

/**
 * Reader page — part of the main app (dashboard) frontend.
 * Accepts ?url and ?title search params to open a specific Sanity PDF.
 * Falls back to NEXT_PUBLIC_SAMPLE_PDF_URL or the bundled sample PDF.
 * Backend: Flask /api/question/generate and /api/answer/submit (Foxit + You.com).
 */
import { useCallback, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import SocraticPopUpIntegrated from "@/components/ui/SocraticPopUpIntegrated";
import type { ReaderEvent } from "@/components/foxit-pdf-viewer";

const FoxitPdfViewer = dynamic(
  () => import("@/components/foxit-pdf-viewer").then((m) => m.FoxitPdfViewer),
  { ssr: false }
);
import { Sidebar } from "@/src/components/Sidebar";
import { mockSidebarItems } from "@/src/data/mock";

const FALLBACK_PDF_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SAMPLE_PDF_URL) || "/Lecture1_modified_JG.pdf";

function ReaderContent() {
  const searchParams = useSearchParams();
  const pdfUrl = searchParams.get("url") ?? FALLBACK_PDF_URL;
  const title = searchParams.get("title") ?? "Reader";

  const [currentEvent, setCurrentEvent] = useState<ReaderEvent | null>(null);

  const handleRequestQuestion = useCallback((event: ReaderEvent) => {
    setCurrentEvent(event);
  }, []);

  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />

        <div className="flex-1 glass-panel rounded-3xl flex flex-col min-h-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
              <p className="text-xs text-gray-400">Active Reading — Socratic Mode</p>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 min-h-0">
            <main className="flex-1 overflow-auto p-4">
              <FoxitPdfViewer
                pdfUrl={pdfUrl}
                onRequestQuestion={handleRequestQuestion}
              />
            </main>

            {/* Socratic sidebar */}
            <aside className="w-[380px] shrink-0 border-l border-white/10 flex flex-col overflow-y-auto">
              {currentEvent ? (
                <SocraticPopUpIntegrated
                  event={currentEvent}
                  onClose={() => setCurrentEvent(null)}
                  onAnswerSubmitted={() => {
                    console.log("Answer submitted!");
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h2 className="text-sm font-semibold text-white mb-2">Socratic Questions</h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Select text in the PDF and click &quot;Request question&quot; to get AI-enhanced Socratic questions.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense>
      <ReaderContent />
    </Suspense>
  );
}