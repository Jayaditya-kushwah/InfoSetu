import { NextResponse } from "next/server";

import { testLLMConnection } from "@/lib/llm";
import { testSupabaseConnection } from "@/lib/supabase/server";

export async function GET() {
  const [llm, supabase] = await Promise.all([
    testLLMConnection(),
    testSupabaseConnection(),
  ]);

  const appReady = supabase.ok;
  const aiReady = llm.ok;

  return NextResponse.json(
    {
      ok: appReady,
      aiReady,
      llm,
      supabase,
      backend:
        "Next.js API routes (/api/generate-rti) — no separate Python server required",
      summary: appReady
        ? aiReady
          ? "Fully operational — AI drafts and database saves enabled."
          : "Partially operational — database works; AI uses offline fallback until you add GROQ_API_KEY."
        : "Database not ready — run supabase/setup.sql in Supabase SQL Editor.",
    },
    { status: appReady ? 200 : 503 }
  );
}
