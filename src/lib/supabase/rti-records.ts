import type { SupabaseClient } from "@supabase/supabase-js";

import type { DbResult, RTIRecord } from "@/lib/user-types";

function mapDbError(error: { message: string }, fallback: string): string {
  if (
    /relation.*does not exist|schema cache|could not find the table/i.test(
      error.message
    )
  ) {
    return "RTI records table not found. Run supabase/user-profiles.sql in Supabase Dashboard → SQL Editor.";
  }
  return error.message || fallback;
}

export async function createRTIRecord(
  supabase: SupabaseClient,
  params: {
    user_id: string;
    user_detail_id: string;
    grievance_text: string;
    rti_content: string;
    target_department?: string | null;
    rti_category?: string | null;
  }
): Promise<DbResult<RTIRecord>> {
  const { data, error } = await supabase
    .from("rti_records")
    .insert({
      user_id: params.user_id,
      user_detail_id: params.user_detail_id,
      grievance_text: params.grievance_text,
      rti_content: params.rti_content,
      target_department: params.target_department ?? null,
      rti_category: params.rti_category ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: mapDbError(error, "Failed to save RTI record") };
  }

  await supabase.from("detail_usage_history").insert({
    user_id: params.user_id,
    user_detail_id: params.user_detail_id,
    rti_record_id: data.id,
    action: "used_in_rti",
  });

  return { ok: true, data: data as RTIRecord };
}

export async function getRTIHistory(
  supabase: SupabaseClient,
  userId: string
): Promise<DbResult<RTIRecord[]>> {
  const { data, error } = await supabase
    .from("rti_records")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: mapDbError(error, "Failed to load RTI history") };
  }

  return { ok: true, data: (data ?? []) as RTIRecord[] };
}

export async function getRTIRecordById(
  supabase: SupabaseClient,
  userId: string,
  recordId: string
): Promise<DbResult<RTIRecord | null>> {
  const { data, error } = await supabase
    .from("rti_records")
    .select("*")
    .eq("id", recordId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: mapDbError(error, "Failed to load RTI record") };
  }

  return { ok: true, data: (data as RTIRecord | null) ?? null };
}
