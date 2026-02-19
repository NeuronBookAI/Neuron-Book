/**
 * API client for Neural Trace backend (Flask).
 * Uses Next.js rewrites: /api/* -> Flask on port 5328.
 * 
 * ENHANCED: Now uses embeddings for context-aware questions
 * and saves answers to Sanity.
 */

import type {
  GenerateQuestionRequest,
  GenerateQuestionResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from "./api-types";

const API_BASE = "/api";

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path}: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Generate a Socratic question using embeddings for PDF context.
 * Uses /api/question/enhanced endpoint.
 */
export async function generateQuestion(
  payload: GenerateQuestionRequest
): Promise<GenerateQuestionResponse> {
  // Use enhanced endpoint with embeddings
  return post<GenerateQuestionResponse>("/question/enhanced", payload);
}

/**
 * Submit answer with dual saving:
 * 1. Gets concept enrichment from You.com
 * 2. Saves to Sanity for tracking
 */
export async function submitAnswer(
  payload: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> {
  // First: Get enrichment from original endpoint
  const enrichmentResponse = await post<SubmitAnswerResponse>(
    "/answer/submit", 
    payload
  );
  
  // Second: Save to Sanity (fire and forget - don't block on this)
  try {
    const confidenceMap: Record<string, number> = {
      'easy': 5,    // Got it instantly
      'medium': 3,  // Took some thought  
      'hard': 1     // Need review
    };
    
    await post("/answer/save-to-sanity", {
      ...payload,
      confidenceScore: confidenceMap[payload.difficulty] || 3,
      pdfContext: "" // Will be populated if embeddings were used
    });
  } catch (error) {
    // Log but don't fail the request
    console.error('Failed to save to Sanity (non-fatal):', error);
  }
  
  return enrichmentResponse;
}