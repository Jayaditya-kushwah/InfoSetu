import {
  friendlyLLMError,
  isAuthError,
  localFallback,
  parseAIResponse,
  RTI_SYSTEM_PROMPT,
  type GenerateResult,
} from "@/lib/llm/shared";

const GROQ_MODEL = "llama-3.3-70b-versatile";

async function callGroq(userInput: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        { role: "system", content: RTI_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Citizen grievance:\n\n${userInput.trim()}`,
        },
      ],
    }),
  });

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      payload.error?.message ?? `Groq API error (${response.status})`
    );
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from Groq");
  }

  return content;
}

export async function generateWithGroq(
  userInput: string,
  options: { allowFallback?: boolean } = {}
): Promise<GenerateResult> {
  const { allowFallback = true } = options;
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    if (allowFallback) {
      return {
        data: localFallback(userInput),
        source: "local-fallback",
        warning:
          "GROQ_API_KEY is missing. Get a free key at https://console.groq.com/keys",
      };
    }
    throw new Error("GROQ_API_KEY is missing in .env");
  }

  try {
    const content = await callGroq(userInput, apiKey);
    return { data: parseAIResponse(content), source: "groq" };
  } catch (error) {
    if (allowFallback && !isAuthError(error)) {
      return {
        data: localFallback(userInput),
        source: "local-fallback",
        warning: friendlyLLMError(error, "groq"),
      };
    }
    throw error;
  }
}

export async function testGroqConnection(): Promise<{
  ok: boolean;
  message: string;
  model?: string;
}> {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    return { ok: false, message: "GROQ_API_KEY is missing in .env" };
  }

  try {
    await callGroq('Test: reply with JSON {"status":"ok"}', apiKey);
    return { ok: true, message: "Groq API is working.", model: GROQ_MODEL };
  } catch (error) {
    return { ok: false, message: friendlyLLMError(error, "groq") };
  }
}
