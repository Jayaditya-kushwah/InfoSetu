import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAllUserDetails } from "@/lib/supabase/user-details";
import { userIdSchema } from "@/lib/validation/user-detail";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "user_id query parameter is required and must be a valid UUID" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const result = await getAllUserDetails(supabase, parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    user_id: parsed.data,
    details: result.data,
    count: result.data.length,
  });
}
