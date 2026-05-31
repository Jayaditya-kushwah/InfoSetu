import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  deactivateUserDetail,
  getUserDetailById,
  updateUserDetail,
} from "@/lib/supabase/user-details";
import {
  formatZodErrors,
  updateUserDetailRequestSchema,
  userIdSchema,
} from "@/lib/validation/user-detail";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id: detailId } = await params;
    const body = await request.json();
    const userId = userIdSchema.safeParse(body.user_id);

    if (!userId.success) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    const parsed = updateUserDetailRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const result = await updateUserDetail(supabase, {
      user_id: userId.data,
      detail_id: detailId,
      input: parsed.data,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      detail: result.data,
      message: "Profile updated successfully",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id: detailId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = userIdSchema.safeParse(searchParams.get("user_id"));

  if (!userId.success) {
    return NextResponse.json(
      { error: "user_id query parameter is required" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const existing = await getUserDetailById(supabase, userId.data, detailId);

  if (!existing.ok) {
    return NextResponse.json({ error: existing.error }, { status: 500 });
  }

  if (!existing.data) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const result = await deactivateUserDetail(supabase, userId.data, detailId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ message: "Profile deleted successfully" });
}
