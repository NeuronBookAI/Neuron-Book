"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Difficulty } from "@/lib/api-types";
import type { GenerateQuestionResponse } from "@/lib/api-types";
import type { ConceptEnrichment } from "@/lib/api-types";
import { cn } from "@/lib/utils";

export type SidebarAction = "answer" | "skip" | "flag";

interface QuestionSidebarProps {
  questionData: GenerateQuestionResponse | null;
  isLoading: boolean;
  error: string | null;
  /** After submit: evaluation + enrichment to show */
  submitResult: { evaluation: string; enrichment?: ConceptEnrichment[] } | null;
  onAnswer: (answer: string, difficulty: Difficulty) => void;
  onSkip: () => void;
  onFlag: () => void;
  onClear: () => void;
}

export function QuestionSidebar({
  questionData,
  isLoading,
  error,
  submitResult,
  onAnswer,
  onSkip,
  onFlag,
  onClear,
}: QuestionSidebarProps) {
  const [action, setAction] = useState<SidebarAction | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const showAnswerForm = action === "answer";
  const hasQuestion = questionData?.question;

  const handleSubmitAnswer = () => {
    onAnswer(answerText, difficulty);
    setAction(null);
    setAnswerText("");
    setDifficulty("medium");
  };

  if (submitResult) {
    return (
      <div className="flex h-full flex-col gap-3 overflow-auto p-4">
        <h3 className="text-sm font-semibold text-foreground">Result</h3>
        <p className="text-sm text-muted-foreground">{submitResult.evaluation}</p>
        {submitResult.enrichment && submitResult.enrichment.length > 0 && (
          <div className="mt-2 space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Concept enrichment (You.com)</h4>
            <ul className="space-y-2 text-xs">
              {submitResult.enrichment.map((e, i) => (
                <li key={i} className="rounded border border-border bg-muted/30 p-2">
                  <span className="font-medium">{e.concept}</span>
                  {e.summary && <p className="mt-1 text-muted-foreground">{e.summary}</p>}
                  {e.relatedConcepts && e.relatedConcepts.length > 0 && (
                    <p className="mt-1">Related: {e.relatedConcepts.slice(0, 3).join(", ")}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={onClear} className="mt-2">
          Continue reading
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={onClear}>
          Dismiss
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Generating question…</p>
      </div>
    );
  }

  if (!hasQuestion) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Select text in the PDF and request a question, or change page to get a Socratic prompt.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4">
      <h3 className="text-sm font-semibold text-foreground">Socratic question</h3>
      <p className="text-sm leading-relaxed">{questionData!.question}</p>
      {questionData!.concepts?.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Concepts: {questionData!.concepts.join(", ")}
        </p>
      )}

      {!showAnswerForm ? (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => setAction("answer")}
          >
            Answer now
          </Button>
          <Button variant="outline" size="sm" onClick={onSkip}>
            Skip
          </Button>
          <Button variant="outline" size="sm" onClick={onFlag}>
            Flag for later
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <textarea
            placeholder="Your answer…"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            className={cn(
              "min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            rows={3}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Difficulty:</span>
            {(["easy", "medium", "hard"] as const).map((d) => (
              <label key={d} className="flex items-center gap-1 text-xs">
                <input
                  type="radio"
                  name="difficulty"
                  value={d}
                  checked={difficulty === d}
                  onChange={() => setDifficulty(d)}
                  className="rounded border-input"
                />
                {d}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmitAnswer} disabled={!answerText.trim()}>
              Submit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAction(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
