/**
 * API client for Neural Trace backend (Flask).
 * Uses Next.js rewrites: /api/* -> Flask on port 5328.
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

export async function generateQuestion(
  payload: GenerateQuestionRequest
): Promise<GenerateQuestionResponse> {
  return post<GenerateQuestionResponse>("/question/generate", payload);
}

export async function submitAnswer(
  payload: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> {
  return post<SubmitAnswerResponse>("/answer/submit", payload);
}
