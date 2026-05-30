import { generateWithGemini, testGeminiConnection } from "@/lib/llm/gemini";
import { generateWithGroq, testGroqConnection } from "@/lib/llm/groq";
import {
  friendlyLLMError,
  getLLMProvider,
  localFallback,
  type GenerateResult,
  type LLMProvider,
} from "@/lib/llm/shared";

export type { DraftSource, GenerateResult, LLMProvider } from "@/lib/llm/shared";

function getConfiguredProviders(): LLMProvider[] {
  const preferred = getLLMProvider();
  const hasGroq = Boolean(process.env.GROQ_API_KEY?.trim());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());

  const order: LLMProvider[] = [preferred];
  const alternate: LLMProvider = preferred === "groq" ? "gemini" : "groq";

  if (alternate === "groq" && hasGroq && !order.includes("groq")) {
    order.push("groq");
  }
  if (alternate === "gemini" && hasGemini && !order.includes("gemini")) {
    order.push("gemini");
  }

  return order;
}

async function tryProvider(
  provider: LLMProvider,
  userInput: string
): Promise<GenerateResult | null> {
  try {
    if (provider === "groq") {
      return await generateWithGroq(userInput, { allowFallback: false });
    }
    return await generateWithGemini(userInput, { allowFallback: false });
  } catch (error) {
    console.warn(`[LLM] ${provider} failed:`, error);
    return null;
  }
}

export async function generateRTI(userInput: string): Promise<GenerateResult> {
  for (const provider of getConfiguredProviders()) {
    const result = await tryProvider(provider, userInput);
    if (result && result.source !== "local-fallback") {
      return result;
    }
  }

  return {
    data: localFallback(userInput),
    source: "local-fallback",
    warning:
      "All AI providers unavailable. Add GROQ_API_KEY (free at console.groq.com/keys) or wait for Gemini quota reset.",
  };
}

export async function testLLMConnection() {
  const providers = getConfiguredProviders();
  const results = [];

  for (const provider of providers) {
    const result =
      provider === "groq"
        ? await testGroqConnection()
        : await testGeminiConnection();
    results.push({ provider, ...result });
    if (result.ok) {
      return { provider, ...result, tried: results };
    }
  }

  const primary =
    results.find((r) => r.provider === providers[0]) ??
    results[results.length - 1];
  return {
    provider: providers[0] ?? "gemini",
    ok: false,
    message: primary?.message ?? "No LLM provider configured",
    tried: results,
  };
}

export function friendlyLLMErrorForActiveProvider(error: unknown): string {
  return friendlyLLMError(error, getLLMProvider());
}
