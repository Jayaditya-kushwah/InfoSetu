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
      "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env"
    );
  }

  const trimmedKey = anonKey.trim();
  const projectRef = getProjectRefFromAnonKey(trimmedKey);
  const envUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const canonicalUrl = projectRef
    ? `https://${projectRef}.supabase.co`
    : undefined;

  const url = canonicalUrl ?? envUrl;
  if (!url) {
    throw new Error(
      "Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL in .env"
    );
  }

  return { url, anonKey: trimmedKey };
}

export function createSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey);
}
