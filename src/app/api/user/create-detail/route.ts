import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createUserDetail,
  ensureUser,
} from "@/lib/supabase/user-details";
import {
  createUserDetailRequestSchema,
  formatZodErrors,
} from "@/lib/validation/user-detail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createUserDetailRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: formatZodErrors(parsed.error),
        },
        { status: 400 }
      );
    }

    const { user_id: requestedUserId, set_active, ...detailInput } = parsed.data;
    const supabase = createSupabaseServerClient();

    const userResult = await ensureUser(supabase, requestedUserId);
    if (!userResult.ok) {
      return NextResponse.json({ error: userResult.error }, { status: 500 });
    }

    const saveResult = await createUserDetail(supabase, {
      user_id: userResult.data.user_id,
      input: detailInput,
      set_active,
    });

    if (!saveResult.ok) {
      return NextResponse.json({ error: saveResult.error }, { status: 500 });
    }

    return NextResponse.json(
      {
        detail_id: saveResult.data.id,
        user_id: userResult.data.user_id,
        detail: saveResult.data,
        message: "User details saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("create-detail error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
