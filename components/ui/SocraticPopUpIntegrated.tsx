"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Brain,
  ArrowRight,
} from "lucide-react";

interface ReaderEvent {
  pdfId: string;
  pageNumber: number;
  selectedText: string;
}

interface SocraticPopUpIntegratedProps {
  event: ReaderEvent;
  onClose: () => void;
  onAnswerSubmitted?: () => void;
}

type Phase = "loading" | "ready" | "submitting" | "success" | "error";

interface SubmitResult {
  evaluation: string;
  concepts: string[];
  enrichment: Array<{ concept: string; summary: string }>;
  neuronId?: string;
  neuronTitle?: string;
  neuronMastery?: number;
}

const CONFIDENCE_OPTIONS = [
  {
    id: "instantly",
    label: "Got it instantly",
    score: 5,
    difficulty: "easy",
    activeClass: "bg-teal-500/20 border-teal-400/60 text-teal-300",
    idleClass:
      "border-white/10 text-gray-400 hover:border-teal-400/30 hover:text-teal-300",
    dot: "bg-teal-400",
  },
  {
    id: "thought",
    label: "Took some thought",
    score: 3,
    difficulty: "medium",
    activeClass: "bg-yellow-500/20 border-yellow-400/60 text-yellow-300",
    idleClass:
      "border-white/10 text-gray-400 hover:border-yellow-400/30 hover:text-yellow-300",
    dot: "bg-yellow-400",
  },
  {
    id: "review",
    label: "Need to review",
    score: 1,
    difficulty: "hard",
    activeClass: "bg-red-500/20 border-red-400/60 text-red-300",
    idleClass:
      "border-white/10 text-gray-400 hover:border-red-400/30 hover:text-red-300",
    dot: "bg-red-400",
  },
] as const;

type ConfidenceId = (typeof CONFIDENCE_OPTIONS)[number]["id"];

export default function SocraticPopUpIntegrated({
  event,
  onClose,
  onAnswerSubmitted,
}: SocraticPopUpIntegratedProps) {
  const { user } = useUser();
  const [phase, setPhase] = useState<Phase>("loading");
  const [question, setQuestion] = useState("");
  const [pdfContext, setPdfContext] = useState<string[]>([]);
  const [showContext, setShowContext] = useState(false);
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState<ConfidenceId | "">("");
  const [validationError, setValidationError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const submittingRef = useRef(false);

  const loadQuestion = useCallback(
    async (signal?: AbortSignal) => {
      setPhase("loading");
      setQuestion("");
      setPdfContext([]);
      setAnswer("");
      setConfidence("");
      setValidationError("");
      setErrorMessage("");
      setResult(null);

      try {
        const res = await fetch("/api/question/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfId: event.pdfId,
            pageNumber: event.pageNumber,
            selectedText: event.selectedText || "",
          }),
          signal,
        });

        const data = await res.json();

        if (!res.ok || !data.question) {
          throw new Error(data.error || "No question returned");
        }

        setQuestion(data.question);

        if (data.pdfContext && data.embeddingsUsed) {
          setPdfContext(data.pdfContext.split("\n---\n").filter(Boolean));
        }

        setPhase("ready");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to load question",
        );
        setPhase("error");
      }
    },
    [event.pdfId, event.pageNumber, event.selectedText],
  );

  // Reload whenever the event changes; abort stale in-flight requests on cleanup.
  useEffect(() => {
    const controller = new AbortController();
    loadQuestion(controller.signal);
    return () => controller.abort();
  }, [loadQuestion]);

  const handleRefresh = useCallback(() => loadQuestion(), [loadQuestion]);

  const handleSubmit = async () => {
    if (submittingRef.current) return;

    if (!answer.trim()) {
      setValidationError("Please write an answer before submitting.");
      return;
    }
    if (!confidence) {
      setValidationError("Please select a confidence level.");
      return;
    }
    setValidationError("");
    submittingRef.current = true;
    setPhase("submitting");

    const option = CONFIDENCE_OPTIONS.find((o) => o.id === confidence)!;

    try {
      // Save first (sequential) to avoid simultaneous writes to the same
      // Sanity document which causes 409 conflicts.
      const saveRes = await fetch("/api/answer/save-to-sanity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          pdfId: event.pdfId,
          pageNumber: event.pageNumber,
          selectedText: event.selectedText,
          question,
          answer,
          confidenceScore: option.score,
          pdfContext: pdfContext.join("\n---\n"),
        }),
      });

      if (!saveRes.ok) {
        const saveData = await saveRes.json();
        throw new Error(
          saveData.error || "Could not save your answer. Please try again.",
        );
      }

      // Then evaluate
      const evalRes = await fetch("/api/answer/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          pdfId: event.pdfId,
          pageNumber: event.pageNumber,
          selectedText: event.selectedText,
          question,
          answer,
          difficulty: option.difficulty,
        }),
      });

      let submitData: Partial<SubmitResult> = {};
      if (evalRes.ok) {
        submitData = await evalRes.json();
      }

      // Create a neuron for this answer in parallel with eval
      let neuronData: {
        neuronId?: string;
        neuronTitle?: string;
        neuronMastery?: number;
      } = {};
      try {
        const neuronRes = await fetch("/api/answer/create-neuron", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedText: event.selectedText,
            question,
            confidenceScore: option.score,
          }),
        });
        if (neuronRes.ok) {
          const n = await neuronRes.json();
          neuronData = {
            neuronId: n.neuronId,
            neuronTitle: n.title,
            neuronMastery: n.masteryLevel,
          };
        }
      } catch {
        // Neuron creation is non-fatal
      }

      setResult({
        evaluation:
          submitData.evaluation ?? "Answer saved to your Neural Trace.",
        concepts: submitData.concepts ?? [],
        enrichment: submitData.enrichment ?? [],
        ...neuronData,
      });
      setPhase("success");
      onAnswerSubmitted?.();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Submission failed");
      setPhase("error");
    } finally {
      submittingRef.current = false;
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const SelectedTextBadge = () =>
    event.selectedText ? (
      <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <BookOpen size={13} className="mt-0.5 shrink-0 text-gray-500" />
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
          &ldquo;{event.selectedText.slice(0, 120)}
          {event.selectedText.length > 120 ? "…" : ""}&rdquo;
        </p>
      </div>
    ) : (
      <p className="text-xs text-gray-500">
        Page {event.pageNumber} — no selection
      </p>
    );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex flex-col gap-4 p-6 h-full">
        <Header
          onClose={onClose}
          onRefresh={handleRefresh}
          showRefresh={false}
        />
        <SelectedTextBadge />
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
          <p className="text-sm text-gray-400">Generating question…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="flex flex-col gap-4 p-6 h-full">
        <Header onClose={onClose} onRefresh={handleRefresh} showRefresh />
        <SelectedTextBadge />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-400/20 flex items-center justify-center">
            <span className="text-xl">⚠️</span>
          </div>
          <p className="text-sm text-red-400">{errorMessage}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 hover:border-teal-400/40 hover:text-white transition-colors"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (phase === "success" && result) {
    return (
      <div className="flex flex-col gap-4 p-6 h-full overflow-y-auto">
        <Header onClose={onClose} onRefresh={handleRefresh} showRefresh />
        <SelectedTextBadge />

        {/* Saved banner */}
        <div className="flex items-center gap-2 rounded-xl border border-teal-400/30 bg-teal-500/10 px-4 py-3">
          <Sparkles size={15} className="shrink-0 text-teal-400" />
          <p className="text-sm text-teal-300 font-medium">
            Answer saved to your Neural Trace
          </p>
        </div>

        {/* Neuron created card */}
        {result.neuronTitle && (
          <a
            href="/network"
            className="group flex items-center gap-3 rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 hover:border-purple-400/60 transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/20">
              <Brain size={15} className="text-purple-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-purple-300 mb-0.5">
                New Neuron Created
              </p>
              <p className="text-xs text-gray-400 truncate">
                {result.neuronTitle}
              </p>
              {result.neuronMastery != null && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-white/10">
                    <div
                      className="h-1 rounded-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all"
                      style={{ width: `${result.neuronMastery}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {result.neuronMastery}% mastery
                  </span>
                </div>
              )}
            </div>
            <ArrowRight
              size={13}
              className="shrink-0 text-gray-500 group-hover:text-purple-300 transition-colors"
            />
          </a>
        )}

        {/* Evaluation */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Feedback
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            {result.evaluation}
          </p>
        </div>

        {/* Enrichment concepts */}
        {result.enrichment.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Key Concepts
            </p>
            {result.enrichment.map((e) => (
              <div
                key={e.concept}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <p className="text-xs font-medium text-teal-400 mb-1">
                  {e.concept}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {e.summary}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleRefresh}
          className="mt-auto w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-gray-300 hover:border-teal-400/40 hover:text-white transition-colors"
        >
          Ask another question
        </button>
      </div>
    );
  }

  // ── Ready / Submitting ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 p-6 h-full overflow-y-auto">
      <Header
        onClose={onClose}
        onRefresh={handleRefresh}
        showRefresh={phase === "ready"}
      />
      <SelectedTextBadge />

      {/* Question box */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-teal-500/5 to-purple-500/5 p-4">
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          Question
        </p>
        <p className="text-sm text-white leading-relaxed">{question}</p>
      </div>

      {/* PDF context (collapsible) */}
      {pdfContext.length > 0 && (
        <div>
          <button
            onClick={() => setShowContext((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showContext ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showContext ? "Hide" : "Show"} related context ({pdfContext.length}
            )
          </button>
          {showContext && (
            <div className="mt-2 flex flex-col gap-2 max-h-36 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-3">
              {pdfContext.map((ctx, i) => (
                <p
                  key={i}
                  className="text-xs text-gray-400 leading-relaxed border-b border-white/5 pb-2 last:border-0 last:pb-0"
                >
                  {ctx.trim()}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Answer textarea */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
          Your Answer
        </label>
        <textarea
          className="w-full h-28 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-400/50 transition-colors disabled:opacity-50"
          placeholder="Explain your thinking…"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setValidationError("");
          }}
          disabled={phase === "submitting"}
        />
      </div>

      {/* Confidence selector */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Confidence
        </p>
        <div className="flex flex-col gap-1.5">
          {CONFIDENCE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setConfidence(opt.id);
                setValidationError("");
              }}
              disabled={phase === "submitting"}
              className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 ${
                confidence === opt.id ? opt.activeClass : opt.idleClass
              }`}
            >
              <span className={`h-2 w-2 rounded-full shrink-0 ${opt.dot}`} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {validationError}
        </p>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={phase === "submitting"}
        className="w-full rounded-xl bg-teal-500 py-3 text-sm font-semibold text-white hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {phase === "submitting" ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Saving…
          </span>
        ) : (
          "Submit Answer"
        )}
      </button>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Header({
  onClose,
  onRefresh,
  showRefresh,
}: {
  onClose: () => void;
  onRefresh: () => void;
  showRefresh: boolean;
}) {
  return (
    <div className="flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500/30 to-purple-500/30 flex items-center justify-center">
          <span className="text-xs">🧠</span>
        </div>
        <h3 className="text-sm font-semibold text-white">Socratic Question</h3>
      </div>
      <div className="flex items-center gap-1">
        {showRefresh && (
          <button
            onClick={onRefresh}
            title="New question"
            className="rounded-lg p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        )}
        <button
          onClick={onClose}
          title="Close"
          className="rounded-lg p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
