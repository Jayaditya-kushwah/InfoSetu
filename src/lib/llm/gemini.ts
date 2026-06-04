import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  friendlyLLMError,
  isAuthError,
  isQuotaOrRateLimitError,
  isValidGeminiKey,
  localFallback,
  parseAIResponse,
  RTI_SYSTEM_PROMPT,
  type GenerateResult,
} from "@/lib/llm/shared";

const GEMINI_MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
] as const;

async function callGeminiModel(
  apiKey: string,
  model: string,
  userInput: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction: RTI_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
    },
  });

  const result = await geminiModel.generateContent(
    `Citizen grievance:\n\n${userInput.trim()}`
  );

  const content = result.response.text();
  if (!content) {
    throw new Error(`Empty response from Gemini model: ${model}`);
  }

  return content;
}

export async function generateWithGemini(
  userInput: string,
  options: { allowFallback?: boolean } = {}
): Promise<GenerateResult> {
  const { allowFallback = true } = options;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    if (allowFallback) {
      return {
        data: localFallback(userInput),
        source: "local-fallback",
        warning:
          "GEMINI_API_KEY is missing. Add your key to .env or switch to Groq: LLM_PROVIDER=groq",
      };
    }
    throw new Error("GEMINI_API_KEY is missing in .env");
  }

  if (!isValidGeminiKey(apiKey)) {
    if (allowFallback) {
      return {
        data: localFallback(userInput),
        source: "local-fallback",
        warning:
          "GEMINI_API_KEY format not recognized. Valid formats: AIza… or AQ.… from https://aistudio.google.com/apikey",
      };
    }
    throw new Error("Unrecognized GEMINI_API_KEY format");
  }

  let lastError: unknown;

  for (const model of GEMINI_MODELS) {
    try {
      const content = await callGeminiModel(apiKey, model, userInput);
      return { data: parseAIResponse(content), source: "gemini" };
    } catch (error) {
      lastError = error;
      if (isAuthError(error)) throw error;
      console.warn(`Gemini model ${model} failed:`, error);
    }
  }

  if (allowFallback) {
    return {
      data: localFallback(userInput),
      source: "local-fallback",
      warning: friendlyLLMError(lastError, "gemini"),
    };
  }

  throw lastError ?? new Error("All Gemini models failed");
}

export async function testGeminiConnection(): Promise<{
  ok: boolean;
  message: string;
  model?: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return { ok: false, message: "GEMINI_API_KEY is missing in .env" };
  }

  if (!isValidGeminiKey(apiKey)) {
    return {
      ok: false,
      message: "GEMINI_API_KEY format not recognized (expected AIza… or AQ.…)",
    };
  }

  try {
    const model = GEMINI_MODELS[0];
    await callGeminiModel(apiKey, model, 'Test: reply with JSON {"status":"ok"}');
    return { ok: true, message: "Gemini API is working.", model };
  } catch (error) {
    return { ok: false, message: friendlyLLMError(error, "gemini") };
  }
}
