import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import type { UserDetail } from "@/lib/user-types";
import {
  createUserDetail,
  deactivateUserDetail,
  ensureUser,
  getAllUserDetails,
  getUserDetailById,
  updateUserDetail,
} from "@/lib/supabase/user-details";

const sampleDetail: UserDetail = {
  id: "detail-1",
  user_id: "user-1",
  full_name: "Jane Doe",
  email: "jane@example.com",
  phone: "9876543210",
  street_address: "456 Park Avenue, Mumbai",
  state: "Maharashtra",
  district: "Mumbai City",
  postal_code: "400001",
  is_active: true,
  deleted_at: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

function createMockSupabase(handlers: Record<string, unknown>): SupabaseClient {
  return {
    from: vi.fn((table: string) => handlers[table]),
  } as unknown as SupabaseClient;
}

describe("ensureUser", () => {
  it("returns existing user when found", async () => {
    const supabase = createMockSupabase({
      users: {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { id: "user-1" },
              error: null,
            })),
          })),
        })),
      },
    });

    const result = await ensureUser(supabase, "user-1");
    expect(result).toEqual({ ok: true, data: { user_id: "user-1" } });
  });

  it("creates a new user when no id is provided", async () => {
    const supabase = createMockSupabase({
      users: {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: { id: "new-user" },
              error: null,
            })),
          })),
        })),
      },
    });

    const result = await ensureUser(supabase);
    expect(result).toEqual({ ok: true, data: { user_id: "new-user" } });
  });
});

describe("getAllUserDetails", () => {
  it("returns all non-deleted details for a user", async () => {
    const supabase = createMockSupabase({
      user_details: {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => ({
              order: vi.fn(async () => ({
                data: [sampleDetail],
                error: null,
              })),
            })),
          })),
        })),
      },
    });

    const result = await getAllUserDetails(supabase, "user-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].full_name).toBe("Jane Doe");
    }
  });
});

describe("getUserDetailById", () => {
  it("returns null when detail is not found", async () => {
    const supabase = createMockSupabase({
      user_details: {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              is: vi.fn(() => ({
                maybeSingle: vi.fn(async () => ({ data: null, error: null })),
              })),
            })),
          })),
        })),
      },
    });

    const result = await getUserDetailById(supabase, "user-1", "missing");
    expect(result).toEqual({ ok: true, data: null });
  });
});

describe("createUserDetail", () => {
  it("inserts detail and logs usage history", async () => {
    const insertHistory = vi.fn(async () => ({ error: null }));

    const supabase = createMockSupabase({
      user_details: {
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(async () => ({ error: null })),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(async () => ({ data: sampleDetail, error: null })),
          })),
        })),
      },
      detail_usage_history: {
        insert: insertHistory,
      },
    });

    const result = await createUserDetail(supabase, {
      user_id: "user-1",
      input: {
        full_name: sampleDetail.full_name,
        email: sampleDetail.email,
        phone: sampleDetail.phone,
        street_address: sampleDetail.street_address,
        state: sampleDetail.state,
        district: sampleDetail.district,
        postal_code: sampleDetail.postal_code,
      },
    });

    expect(result.ok).toBe(true);
    expect(insertHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        user_detail_id: "detail-1",
        action: "created",
      })
    );
  });
});

describe("updateUserDetail", () => {
  it("returns error when detail does not exist", async () => {
    const supabase = createMockSupabase({
      user_details: {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              is: vi.fn(() => ({
                maybeSingle: vi.fn(async () => ({ data: null, error: null })),
              })),
            })),
          })),
        })),
      },
    });

    const result = await updateUserDetail(supabase, {
      user_id: "user-1",
      detail_id: "missing",
      input: { full_name: "Updated Name" },
    });

    expect(result).toEqual({ ok: false, error: "User detail not found" });
  });
});

describe("deactivateUserDetail", () => {
  it("soft-deletes detail and logs deactivated action", async () => {
    const insertHistory = vi.fn(async () => ({ error: null }));

    const supabase = createMockSupabase({
      user_details: {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              is: vi.fn(() => ({
                maybeSingle: vi.fn(async () => ({
                  data: sampleDetail,
                  error: null,
                })),
              })),
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(async () => ({
                  data: { ...sampleDetail, is_active: false },
                  error: null,
                })),
              })),
            })),
          })),
        })),
      },
      detail_usage_history: {
        insert: insertHistory,
      },
    });

    const result = await deactivateUserDetail(supabase, "user-1", "detail-1");
    expect(result.ok).toBe(true);
    expect(insertHistory).toHaveBeenCalledWith(
      expect.objectContaining({ action: "deactivated" })
    );
  });
});
