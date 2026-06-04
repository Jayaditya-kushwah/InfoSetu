import { NextResponse } from "next/server";

import { RTI_CATEGORY_LABELS, detectRTICategory } from "@/lib/rti-categories";

export async function POST(request: Request) {
  try {
    const { user_input } = (await request.json()) as { user_input?: string };

    if (!user_input?.trim()) {
      return NextResponse.json({ error: "user_input is required" }, { status: 400 });
    }

    const category = detectRTICategory(user_input.trim());

    return NextResponse.json({
      category,
      label: RTI_CATEGORY_LABELS[category],
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
