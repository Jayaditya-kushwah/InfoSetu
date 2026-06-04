import { describe, expect, it } from "vitest";

import {
  createUserDetailRequestSchema,
  userDetailSchema,
  userIdSchema,
} from "@/lib/validation/user-detail";

const validDetail = {
  full_name: "John Doe",
  email: "john@example.com",
  phone: "9876543210",
  street_address: "123 Main Street, Bangalore",
  state: "Karnataka",
  district: "Bengaluru Urban",
  postal_code: "560001",
};

describe("userDetailSchema", () => {
  it("accepts valid Indian user details", () => {
    const result = userDetailSchema.safeParse(validDetail);
    expect(result.success).toBe(true);
  });

  it("rejects phone numbers that are not 10 digits", () => {
    const result = userDetailSchema.safeParse({
      ...validDetail,
      phone: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects postal codes that are not 6 digits", () => {
    const result = userDetailSchema.safeParse({
      ...validDetail,
      postal_code: "5600",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = userDetailSchema.safeParse({
      ...validDetail,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects names with digits", () => {
    const result = userDetailSchema.safeParse({
      ...validDetail,
      full_name: "John123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short street addresses", () => {
    const result = userDetailSchema.safeParse({
      ...validDetail,
      street_address: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("createUserDetailRequestSchema", () => {
  it("accepts optional user_id UUID", () => {
    const result = createUserDetailRequestSchema.safeParse({
      ...validDetail,
      user_id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid user_id UUID", () => {
    const result = createUserDetailRequestSchema.safeParse({
      ...validDetail,
      user_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("userIdSchema", () => {
  it("accepts valid UUID", () => {
    expect(userIdSchema.safeParse("550e8400-e29b-41d4-a716-446655440000").success).toBe(
      true
    );
  });

  it("rejects invalid UUID", () => {
    expect(userIdSchema.safeParse("abc").success).toBe(false);
  });
});
