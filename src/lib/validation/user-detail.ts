import { z } from "zod";

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
const INDIAN_POSTAL_REGEX = /^\d{6}$/;
const FULL_NAME_REGEX = /^[A-Za-z\s.'-]{2,100}$/;

export const userDetailSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters")
    .regex(FULL_NAME_REGEX, "Full name may only contain letters, spaces, and . ' -"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(254, "Email is too long"),
  phone: z
    .string()
    .trim()
    .regex(
      INDIAN_PHONE_REGEX,
      "Phone must be exactly 10 digits (Indian mobile format)"
    ),
  street_address: z
    .string()
    .trim()
    .min(10, "Street address must be at least 10 characters")
    .max(500, "Street address is too long"),
  state: z.string().trim().min(1, "State is required"),
  district: z.string().trim().min(1, "District is required"),
  postal_code: z
    .string()
    .trim()
    .regex(INDIAN_POSTAL_REGEX, "Postal code must be exactly 6 digits"),
});

export const userIdSchema = z.string().uuid("user_id must be a valid UUID");

export const createUserDetailRequestSchema = userDetailSchema.extend({
  user_id: userIdSchema.optional(),
  set_active: z.boolean().optional().default(true),
});

export const updateUserDetailRequestSchema = userDetailSchema.partial();

export type UserDetailFormValues = z.infer<typeof userDetailSchema>;
export type CreateUserDetailRequest = z.infer<typeof createUserDetailRequestSchema>;

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
