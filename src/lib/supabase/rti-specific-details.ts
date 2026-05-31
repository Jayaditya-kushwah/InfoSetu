import type { SupabaseClient } from "@supabase/supabase-js";

import type { RTICategory } from "@/lib/rti-categories";
import type { DbResult } from "@/lib/user-types";

function mapDbError(error: { message: string }, fallback: string): string {
  if (
    /relation.*does not exist|schema cache|could not find the table/i.test(
      error.message
    )
  ) {
    return "RTI specific details table not found. Run supabase/rti-adaptive.sql in Supabase Dashboard → SQL Editor.";
  }
  return error.message || fallback;
}

export async function getRTISpecificAnswers(
  supabase: SupabaseClient,
  userId: string,
  category: RTICategory
): Promise<DbResult<Record<string, string>>> {
  const { data, error } = await supabase
    .from("rti_specific_details")
    .select("answers")
    .eq("user_id", userId)
    .eq("rti_category", category)
    .maybeSingle();

  if (error) {
    return { ok: false, error: mapDbError(error, "Failed to load RTI answers") };
  }

  return { ok: true, data: (data?.answers as Record<string, string>) ?? {} };
}

export async function saveRTISpecificAnswers(
  supabase: SupabaseClient,
  params: {
    user_id: string;
    rti_category: RTICategory;
    answers: Record<string, string>;
  }
): Promise<DbResult<Record<string, string>>> {
  const { data, error } = await supabase
    .from("rti_specific_details")
    .upsert(
      {
        user_id: params.user_id,
        rti_category: params.rti_category,
        answers: params.answers,
      },
      { onConflict: "user_id,rti_category" }
    )
    .select("answers")
    .single();

  if (error) {
    return { ok: false, error: mapDbError(error, "Failed to save RTI answers") };
  }

  return { ok: true, data: data.answers as Record<string, string> };
}
