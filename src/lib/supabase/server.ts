import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getProjectRefFromAnonKey(anonKey: string): string | null {
  try {
    const payloadSegment = anonKey.split(".")[1];
    if (!payloadSegment) return null;

    const payload = JSON.parse(
      Buffer.from(
        payloadSegment.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString()
    ) as { ref?: string };

    return payload.ref ?? null;
  } catch {
    return null;
  }
}

function getSupabaseConfig() {
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!anonKey?.trim()) {
    throw new Error(
      "Missing Supabase anon key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env"
    );
  }

  const trimmedKey = anonKey.trim();
  const projectRef = getProjectRefFromAnonKey(trimmedKey);
  const envUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const canonicalUrl = projectRef
    ? `https://${projectRef}.supabase.co`
    : undefined;

  if (envUrl && canonicalUrl && envUrl !== canonicalUrl) {
    console.warn(
      `[Supabase] URL mismatch — .env has ${envUrl} but anon key expects ${canonicalUrl}. Using ${canonicalUrl}.`
    );
  }

  const url = canonicalUrl ?? envUrl;
  if (!url) {
    throw new Error(
      "Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL in .env"
    );
  }

  return { url, anonKey: trimmedKey };
}

export function createSupabaseServerClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey);
}

export async function saveRTIApplication(record: {
  user_input: string;
  generated_draft: string;
  target_department: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("rti_applications").insert(record);

    if (error) {
      if (/relation.*does not exist/i.test(error.message)) {
        return {
          ok: false,
          error:
            "Table rti_applications not found. Run supabase/setup.sql in your Supabase SQL Editor.",
        };
      }
      if (/row-level security|RLS|policy/i.test(error.message)) {
        return {
          ok: false,
          error:
            "Insert blocked by RLS. Run supabase/setup.sql in your Supabase SQL Editor to allow inserts.",
        };
      }
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";

    if (/fetch failed|ENOTFOUND|ECONNREFUSED/i.test(message)) {
      return {
        ok: false,
        error:
          "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_ANON_KEY in .env — the URL is auto-derived from this key.",
      };
    }

    return { ok: false, error: message };
  }
}

export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  message: string;
  url?: string;
}> {
  try {
    const { url, anonKey } = getSupabaseConfig();
    const supabase = createClient(url, anonKey);
    const { error } = await supabase
      .from("rti_applications")
      .select("user_input")
      .limit(1);

    if (error) {
      if (/relation.*does not exist/i.test(error.message)) {
        return {
          ok: false,
          message:
            "Connected to Supabase, but table rti_applications is missing. Run supabase/setup.sql.",
          url,
        };
      }
      return { ok: false, message: error.message, url };
    }

    return { ok: true, message: "Supabase connected and table exists.", url };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Supabase connection failed",
    };
  }
}
