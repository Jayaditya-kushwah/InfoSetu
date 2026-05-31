import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setActiveUserDetail } from "@/lib/supabase/user-details";
import { userIdSchema } from "@/lib/validation/user-detail";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: detailId } = await params;
  const body = (await request.json()) as { user_id?: string };
  const userId = userIdSchema.safeParse(body.user_id);

  if (!userId.success) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const result = await setActiveUserDetail(supabase, userId.data, detailId);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    detail: result.data,
    message: "Active profile updated",
  });
}
