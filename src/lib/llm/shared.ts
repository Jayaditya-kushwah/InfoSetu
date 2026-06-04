import { RTI_SYSTEM_PROMPT } from "@/lib/prompts";
import { generateRTIDraft } from "@/lib/rti-generator";
import type { GenerateRTIResponse } from "@/lib/rti-types";

export type DraftSource = "gemini" | "groq" | "local-fallback";
export type LLMProvider = "gemini" | "groq";

export interface GenerateResult {
  data: GenerateRTIResponse;
  source: DraftSource;
  warning?: string;
}

export function parseAIResponse(content: string): GenerateRTIResponse {
  const parsed = JSON.parse(content) as GenerateRTIResponse;

  if (
    !parsed.target_department ||
    !parsed.generated_draft ||
    !parsed.subject ||
    !Array.isArray(parsed.body)
  ) {
    throw new Error("AI response missing required fields");
  }

  return parsed;
}

export function localFallback(userInput: string): GenerateRTIResponse {
  const draft = generateRTIDraft(userInput);
  return {
    target_department: draft.department,
    subject: draft.subject,
    generated_draft: draft.body.join("\n"),
    body: draft.body,
  };
}

export function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER?.toLowerCase();
  if (provider === "groq") return "groq";
  return "gemini";
}

/** Google now issues both AIza… (legacy) and AQ.… (new) keys — both are valid. */
export function isValidGeminiKey(key: string): boolean {
  return key.startsWith("AIza") || key.startsWith("AQ.");
}

export function isQuotaOrRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /429|quota|rate.?limit|too many requests|resource exhausted/i.test(message);
}

export function isAuthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /401|403|invalid.*key|permission denied|unauthorized/i.test(message);
}

export function friendlyLLMError(error: unknown, provider: LLMProvider): string {
  if (isAuthError(error)) {
    if (provider === "groq") {
      return "Invalid Groq API key. Get a free key at https://console.groq.com/keys and set GROQ_API_KEY in .env.";
    }
    return "Invalid Gemini API key. Check GEMINI_API_KEY in .env (AIza… or AQ.… formats are both valid).";
  }

  if (isQuotaOrRateLimitError(error)) {
    if (provider === "groq") {
      return "Groq rate limit hit. Wait a minute or switch LLM_PROVIDER=gemini in .env.";
    }
    return "Gemini quota exceeded. Switch to Groq (free): set LLM_PROVIDER=groq and GROQ_API_KEY in .env — see https://console.groq.com/keys";
  }

  return error instanceof Error ? error.message : "Failed to generate RTI draft.";
}

export { RTI_SYSTEM_PROMPT };
