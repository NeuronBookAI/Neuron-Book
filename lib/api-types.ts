/**
 * Types for Neural Trace / Socratic question API (Flask backend).
 */

export interface GenerateQuestionRequest {
  pdfId: string;
  pageNumber: number;
  selectedText: string;
}

export interface GenerateQuestionResponse {
  question: string;
  concepts: string[];
  anchor: { pageNumber: number };
}

export type Difficulty = "easy" | "medium" | "hard";

export interface SubmitAnswerRequest {
  pdfId: string;
  pageNumber: number;
  selectedText: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
}

export interface ConceptEnrichment {
  concept: string;
  definitions?: string[];
  examples?: string[];
  relatedConcepts?: string[];
  summary?: string;
}

export interface SubmitAnswerResponse {
  evaluation: string;
  concepts: string[];
  enrichment?: ConceptEnrichment[];
}
