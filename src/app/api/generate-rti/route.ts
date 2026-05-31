import { NextResponse } from "next/server";
import { z } from "zod";

import {
  formatCategoryAnswersForPrompt,
  RTI_CATEGORIES,
} from "@/lib/rti-categories";
import {
  friendlyLLMErrorForActiveProvider,
  generateRTI,
  testLLMConnection,
} from "@/lib/llm";
import { buildDraftFromAIResponse } from "@/lib/rti-types";
import { injectUserDataIntoDraft } from "@/lib/rti-template";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createRTIRecord } from "@/lib/supabase/rti-records";
import { getUserDetailById } from "@/lib/supabase/user-details";
import { saveRTIApplication } from "@/lib/supabase/server";
import { userIdSchema } from "@/lib/validation/user-detail";

const generateRequestSchema = z.object({
  user_input: z.string().min(10, "user_input must be at least 10 characters"),
  user_id: userIdSchema.optional(),
  user_detail_id: z.string().uuid().optional(),
  rti_category: z.enum(RTI_CATEGORIES).optional(),
  rti_specific_answers: z.record(z.string()).optional(),
  confirmed: z.boolean().optional().default(false),
});

export async function GET() {
  const result = await testLLMConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = generateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const {
      user_input,
      user_id,
      user_detail_id,
      rti_category,
      rti_specific_answers,
      confirmed,
    } = parsed.data;

    const trimmedInput = user_input.trim();
    let enrichedInput = trimmedInput;

    if (rti_category && rti_specific_answers) {
      enrichedInput += formatCategoryAnswersForPrompt(
        rti_category,
        rti_specific_answers
      );
    }

    const result = await generateRTI(enrichedInput);

    let userDetail = null;
    if (user_id && user_detail_id) {
      const supabase = createSupabaseServerClient();
      const detailResult = await getUserDetailById(
        supabase,
        user_id,
        user_detail_id
      );
      if (detailResult.ok && detailResult.data) {
        userDetail = detailResult.data;
      }
    }

    let previewDraft = buildDraftFromAIResponse(result.data, userDetail ?? undefined);
    if (userDetail) {
      previewDraft = injectUserDataIntoDraft(previewDraft, userDetail);
    }

    const saveResult = await saveRTIApplication({
      user_input: trimmedInput,
      generated_draft: previewDraft.generatedDraft,
      target_department: result.data.target_department,
    });

    let rtiRecordId: string | undefined;
    let rtiRecordError: string | undefined;

    if (confirmed && user_id && user_detail_id && userDetail) {
      const supabase = createSupabaseServerClient();
      const recordResult = await createRTIRecord(supabase, {
        user_id,
        user_detail_id,
        grievance_text: trimmedInput,
        rti_content: previewDraft.generatedDraft,
        target_department: result.data.target_department,
        rti_category: rti_category ?? null,
      });

      if (recordResult.ok) {
        rtiRecordId = recordResult.data.id;
      } else {
        rtiRecordError = recordResult.error;
      }
    }

    return NextResponse.json({
      ...result.data,
      draft: previewDraft,
      rti_category: rti_category ?? null,
      user_detail_applied: Boolean(userDetail),
      _meta: {
        source: result.source,
        warning: result.warning,
        saved: saveResult.ok,
        saveError: saveResult.ok ? undefined : saveResult.error,
        rti_record_id: rtiRecordId,
        rtiRecordError,
        confirmed,
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
