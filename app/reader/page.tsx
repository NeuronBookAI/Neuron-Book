"use client";

/**
 * Reader page — part of the main app (dashboard) frontend.
 * Uses the same layout as Dashboard/Library (Sidebar + glass-bg).
 * Backend: Flask /api/question/generate and /api/answer/submit (Foxit + You.com).
 */
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Sidebar } from "../../src/components/Sidebar";
import { QuestionSidebar } from "@/components/question-sidebar";
import { mockSidebarItems } from "../../src/data/mock";

const FoxitPdfViewer = dynamic(
  () => import("@/components/foxit-pdf-viewer").then((m) => ({ default: m.FoxitPdfViewer })),
  { ssr: false }
);
import type { GenerateQuestionResponse, ConceptEnrichment, Difficulty } from "@/lib/api-types";
import { generateQuestion, submitAnswer } from "@/lib/neural-trace-api";

const SAMPLE_PDF_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SAMPLE_PDF_URL) || "/Lecture1_modified_JG.pdf";

export default function ReaderPage() {
  const [questionData, setQuestionData] = useState<GenerateQuestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<{
    evaluation: string;
    enrichment?: ConceptEnrichment[];
  } | null>(null);
  const [lastEvent, setLastEvent] = useState<{
    pdfId: string;
    pageNumber: number;
    selectedText: string;
  } | null>(null);

  const requestQuestion = useCallback(
    async (pdfId: string, pageNumber: number, selectedText: string) => {
      setError(null);
      setSubmitResult(null);
      setIsLoading(true);
      setQuestionData(null);
      setLastEvent({ pdfId, pageNumber, selectedText });
      try {
        const res = await generateQuestion({ pdfId, pageNumber, selectedText });
        setQuestionData(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to generate question");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleAnswer = useCallback(
    async (answer: string, difficulty: Difficulty) => {
      if (!lastEvent || !questionData?.question) return;
      setError(null);
      try {
        const res = await submitAnswer({
          pdfId: lastEvent.pdfId,
          pageNumber: lastEvent.pageNumber,
          selectedText: lastEvent.selectedText,
          question: questionData.question,
          answer,
          difficulty,
        });
        setSubmitResult({
          evaluation: res.evaluation,
          enrichment: res.enrichment,
        });
        setQuestionData(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to submit answer");
      }
    },
    [lastEvent, questionData]
  );

  const handleSkip = useCallback(() => {
    setQuestionData(null);
    setLastEvent(null);
  }, []);

  const handleFlag = useCallback(() => {
    setQuestionData(null);
    setLastEvent(null);
  }, []);

  const handleClear = useCallback(() => {
    setSubmitResult(null);
    setQuestionData(null);
    setLastEvent(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="glass-panel rounded-3xl flex-1 flex flex-col overflow-hidden">
            <header className="border-b border-white/10 px-4 py-2 shrink-0">
              <h1 className="text-lg font-semibold text-white">Reader — Socratic questions</h1>
            </header>
            <div className="flex flex-1 min-h-0">
              <main className="flex-1 overflow-auto p-4">
                <FoxitPdfViewer
                  pdfUrl={SAMPLE_PDF_URL}
                  onRequestQuestion={(ev) => requestQuestion(ev.pdfId, ev.pageNumber, ev.selectedText)}
                />
              </main>
              <aside className="w-[360px] shrink-0 border-l border-white/10 bg-black/20 flex flex-col">
                <div className="border-b border-white/10 px-4 py-2">
                  <h2 className="text-sm font-medium text-gray-400">Socratic questions</h2>
                </div>
                <div className="flex-1 overflow-hidden">
                  <QuestionSidebar
                    questionData={questionData}
                    isLoading={isLoading}
                    error={error}
                    submitResult={submitResult}
                    onAnswer={handleAnswer}
                    onSkip={handleSkip}
                    onFlag={handleFlag}
                    onClear={handleClear}
                  />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
