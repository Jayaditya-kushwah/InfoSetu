import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().min(1, "Search query required"),
  department: z.string().optional(),
  category: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
});

/**
 * Phase 1C: Search Past RTIs
 * GET /api/rti/search
 *
 * Search through past RTI applications with keyword + filters
 * Uses Supabase PostgreSQL full-text search
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const params = searchSchema.safeParse({
      q: searchParams.get("q"),
      department: searchParams.get("department") || undefined,
      category: searchParams.get("category") || undefined,
      fromDate: searchParams.get("fromDate") || undefined,
      toDate: searchParams.get("toDate") || undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit") as string)
        : 20,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset") as string)
        : 0,
    });

    if (!params.success) {
      return NextResponse.json(
        { error: params.error.issues[0]?.message ?? "Invalid search params" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { q, department, category, fromDate, toDate, limit, offset } = params.data;

    // Build base query with text search
    let query = supabase
      .from("rti_applications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Full-text search using ilike (case-insensitive substring match)
    if (q) {
      query = query.or(
        `user_input.ilike.%${q}%,generated_draft.ilike.%${q}%,target_department.ilike.%${q}%`
      );
    }

    // Filter by department if provided
    if (department && department.trim()) {
      query = query.ilike("target_department", `%${department}%`);
    }

    // Filter by category if provided
    if (category && category.trim()) {
      query = query.eq("category", category);
    }

    // Filter by date range if provided
    if (fromDate && fromDate.trim()) {
      query = query.gte("created_at", fromDate);
    }
    if (toDate && toDate.trim()) {
      query = query.lte("created_at", toDate);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[RTI Search] Database error:", error);
      return NextResponse.json(
        { error: "Failed to search RTI applications" },
        { status: 500 }
      );
    }

    // Process results to extract excerpts
    const results = (data || []).map((rti: any) => {
      // Create excerpt from user_input (first 150 chars)
      const fullText = rti.user_input || rti.generated_draft || "";
      const excerpt = fullText.substring(0, 150).trim();

      return {
        id: rti.id,
        subject: rti.target_department || "RTI Application",
        createdAt: rti.created_at,
        department: rti.target_department,
        category: rti.category,
        excerpt: excerpt + (excerpt.length === 150 ? "..." : ""),
        userInput: rti.user_input,
        draft: rti.generated_draft,
      };
    });

    return NextResponse.json({
      results,
      total: count || 0,
      limit,
      offset,
      hasMore: offset + limit < (count || 0),
    });
  } catch (error) {
    console.error("[RTI Search] Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
