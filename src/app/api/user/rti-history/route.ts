import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRTIHistory } from "@/lib/supabase/rti-records";
import { userIdSchema } from "@/lib/validation/user-detail";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = userIdSchema.safeParse(searchParams.get("user_id"));

  if (!userId.success) {
    return NextResponse.json(
      { error: "user_id query parameter is required" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const result = await getRTIHistory(supabase, userId.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    user_id: userId.data,
    records: result.data,
    count: result.data.length,
  });
}
