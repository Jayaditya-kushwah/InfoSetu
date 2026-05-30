import { NextResponse } from "next/server";

import {
  friendlyLLMErrorForActiveProvider,
  generateRTI,
  testLLMConnection,
} from "@/lib/llm";
import { saveRTIApplication } from "@/lib/supabase/server";

export async function GET() {
  const result = await testLLMConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}

export async function POST(request: Request) {
  try {
    const { user_input } = (await request.json()) as { user_input?: string };

    if (!user_input?.trim()) {
      return NextResponse.json(
        { error: "user_input is required" },
        { status: 400 }
      );
    }

    const trimmedInput = user_input.trim();
    const result = await generateRTI(trimmedInput);

    const saveResult = await saveRTIApplication({
      user_input: trimmedInput,
      generated_draft: result.data.generated_draft,
      target_department: result.data.target_department,
    });

    return NextResponse.json({
      ...result.data,
      _meta: {
        source: result.source,
        warning: result.warning,
        saved: saveResult.ok,
        saveError: saveResult.ok ? undefined : saveResult.error,
      },
    });
  } catch (error) {
    console.error("generate-rti error:", error);
    return NextResponse.json(
      { error: friendlyLLMErrorForActiveProvider(error) },
      { status: 500 }
    );
  }
}
