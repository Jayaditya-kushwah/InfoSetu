import { NextResponse } from "next/server";
import { z } from "zod";

import { RTI_CATEGORIES, type RTICategory } from "@/lib/rti-categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getRTISpecificAnswers,
  saveRTISpecificAnswers,
} from "@/lib/supabase/rti-specific-details";
import { userIdSchema } from "@/lib/validation/user-detail";

const categorySchema = z.enum(RTI_CATEGORIES);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = userIdSchema.safeParse(searchParams.get("user_id"));
  const category = categorySchema.safeParse(searchParams.get("category"));

  if (!userId.success || !category.success) {
    return NextResponse.json(
      { error: "user_id and category query parameters are required" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const result = await getRTISpecificAnswers(
    supabase,
    userId.data,
    category.data as RTICategory
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    user_id: userId.data,
    category: category.data,
    answers: result.data,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = userIdSchema.safeParse(body.user_id);
    const category = categorySchema.safeParse(body.rti_category);

    if (!userId.success || !category.success) {
      return NextResponse.json(
        { error: "user_id and rti_category are required" },
        { status: 400 }
      );
    }

    const answers =
      typeof body.answers === "object" && body.answers !== null
        ? (body.answers as Record<string, string>)
        : {};

    const supabase = createSupabaseServerClient();
    const result = await saveRTISpecificAnswers(supabase, {
      user_id: userId.data,
      rti_category: category.data as RTICategory,
      answers,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      user_id: userId.data,
      category: category.data,
      answers: result.data,
      message: "RTI-specific details saved",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
