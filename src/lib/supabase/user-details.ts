import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  DbResult,
  DetailUsageAction,
  UserDetail,
  UserDetailInput,
} from "@/lib/user-types";

function mapDbError(error: { message: string }, fallback: string): string {
  if (
    /relation.*does not exist|schema cache|could not find the table/i.test(
      error.message
    )
  ) {
    return "User profile tables not found. Run supabase/user-profiles.sql in Supabase Dashboard → SQL Editor, then retry.";
  }
  if (/row-level security|RLS|policy/i.test(error.message)) {
    return "Database access blocked by RLS. Run supabase/user-profiles.sql to configure policies.";
  }
  return error.message || fallback;
}

export async function ensureUser(
  supabase: SupabaseClient,
  userId?: string
): Promise<DbResult<{ user_id: string }>> {
  if (userId) {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return { ok: false, error: mapDbError(error, "Failed to look up user") };
    }

    if (data) {
      return { ok: true, data: { user_id: data.id } };
    }

    const { data: created, error: insertError } = await supabase
      .from("users")
      .insert({ id: userId })
      .select("id")
      .single();

    if (insertError) {
      return {
        ok: false,
        error: mapDbError(insertError, "Failed to create user"),
      };
    }

    return { ok: true, data: { user_id: created.id } };
  }

  const { data, error } = await supabase.from("users").insert({}).select("id").single();

  if (error) {
    return { ok: false, error: mapDbError(error, "Failed to create user") };
  }

  return { ok: true, data: { user_id: data.id } };
}

async function logDetailUsage(
  supabase: SupabaseClient,
  params: {
    user_id: string;
    user_detail_id: string;
    action: DetailUsageAction;
    rti_record_id?: string | null;
  }
): Promise<void> {
  await supabase.from("detail_usage_history").insert({
    user_id: params.user_id,
    user_detail_id: params.user_detail_id,
    action: params.action,
    rti_record_id: params.rti_record_id ?? null,
  });
}

export async function createUserDetail(
  supabase: SupabaseClient,
  params: {
    user_id: string;
    input: UserDetailInput;
    set_active?: boolean;
  }
): Promise<DbResult<UserDetail>> {
  const setActive = params.set_active ?? true;

  if (setActive) {
    const { error: deactivateError } = await supabase
      .from("user_details")
      .update({ is_active: false })
      .eq("user_id", params.user_id)
      .is("deleted_at", null);

    if (deactivateError) {
      return {
        ok: false,
        error: mapDbError(deactivateError, "Failed to update active profile"),
      };
    }
  }

  const { data, error } = await supabase
    .from("user_details")
    .insert({
      user_id: params.user_id,
      ...params.input,
      is_active: setActive,
    })
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      error: mapDbError(error, "Failed to save user details"),
    };
  }

  await logDetailUsage(supabase, {
    user_id: params.user_id,
    user_detail_id: data.id,
    action: "created",
  });

  return { ok: true, data: data as UserDetail };
}

export async function getAllUserDetails(
  supabase: SupabaseClient,
  userId: string
): Promise<DbResult<UserDetail[]>> {
  const { data, error } = await supabase
    .from("user_details")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      ok: false,
      error: mapDbError(error, "Failed to fetch user details"),
    };
  }

  return { ok: true, data: (data ?? []) as UserDetail[] };
}

export async function getUserDetailById(
  supabase: SupabaseClient,
  userId: string,
  detailId: string
): Promise<DbResult<UserDetail | null>> {
  const { data, error } = await supabase
    .from("user_details")
    .select("*")
    .eq("id", detailId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      error: mapDbError(error, "Failed to fetch user detail"),
    };
  }

  return { ok: true, data: (data as UserDetail | null) ?? null };
}

export async function updateUserDetail(
  supabase: SupabaseClient,
  params: {
    user_id: string;
    detail_id: string;
    input: Partial<UserDetailInput>;
  }
): Promise<DbResult<UserDetail>> {
  const existing = await getUserDetailById(supabase, params.user_id, params.detail_id);

  if (!existing.ok) {
    return existing;
  }

  if (!existing.data) {
    return { ok: false, error: "User detail not found" };
  }

  const { data, error } = await supabase
    .from("user_details")
    .update(params.input)
    .eq("id", params.detail_id)
    .eq("user_id", params.user_id)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      error: mapDbError(error, "Failed to update user details"),
    };
  }

  await logDetailUsage(supabase, {
    user_id: params.user_id,
    user_detail_id: params.detail_id,
    action: "updated",
  });

  return { ok: true, data: data as UserDetail };
}

export async function deactivateUserDetail(
  supabase: SupabaseClient,
  userId: string,
  detailId: string
): Promise<DbResult<UserDetail>> {
  const existing = await getUserDetailById(supabase, userId, detailId);

  if (!existing.ok) {
    return existing;
  }

  if (!existing.data) {
    return { ok: false, error: "User detail not found" };
  }

  const { data, error } = await supabase
    .from("user_details")
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
    })
    .eq("id", detailId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      error: mapDbError(error, "Failed to deactivate user details"),
    };
  }

  await logDetailUsage(supabase, {
    user_id: userId,
    user_detail_id: detailId,
    action: "deactivated",
  });

  return { ok: true, data: data as UserDetail };
}

export async function setActiveUserDetail(
  supabase: SupabaseClient,
  userId: string,
  detailId: string
): Promise<DbResult<UserDetail>> {
  const existing = await getUserDetailById(supabase, userId, detailId);
  if (!existing.ok) return existing;
  if (!existing.data) {
    return { ok: false, error: "User detail not found" };
  }

  const { error: deactivateError } = await supabase
    .from("user_details")
    .update({ is_active: false })
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (deactivateError) {
    return {
      ok: false,
      error: mapDbError(deactivateError, "Failed to update active profile"),
    };
  }

  const { data, error } = await supabase
    .from("user_details")
    .update({ is_active: true })
    .eq("id", detailId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      error: mapDbError(error, "Failed to set active profile"),
    };
  }

  return { ok: true, data: data as UserDetail };
}

export async function testUserProfileTables(
  supabase: SupabaseClient
): Promise<{ ok: boolean; message: string }> {
  const { error } = await supabase.from("users").select("id").limit(1);

  if (error) {
    if (/relation.*does not exist/i.test(error.message)) {
      return {
        ok: false,
        message:
          "Connected to Supabase, but user profile tables are missing. Run supabase/user-profiles.sql.",
      };
    }
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "User profile tables exist." };
}
