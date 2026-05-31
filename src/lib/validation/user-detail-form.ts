import type { ZodIssue } from "zod";

import {
  userDetailSchema,
  type UserDetailFormValues,
} from "@/lib/validation/user-detail";

export type UserDetailField = keyof UserDetailFormValues;

export const EMPTY_USER_DETAIL_FORM: UserDetailFormValues = {
  full_name: "",
  email: "",
  phone: "",
  street_address: "",
  state: "",
  district: "",
  postal_code: "",
};

export function validateUserDetailField(
  field: UserDetailField,
  value: string
): string | undefined {
  const result = userDetailSchema.shape[field].safeParse(value);
  if (result.success) return undefined;
  return result.error.issues[0]?.message;
}

export function validateUserDetailForm(
  values: UserDetailFormValues
): Partial<Record<UserDetailField, string>> {
  const result = userDetailSchema.safeParse(values);
  if (result.success) return {};

  const errors: Partial<Record<UserDetailField, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field as UserDetailField]) {
      errors[field as UserDetailField] = issue.message;
    }
  }
  return errors;
}

export function issueMessageForField(
  issues: ZodIssue[],
  field: UserDetailField
): string | undefined {
  return issues.find((issue) => issue.path[0] === field)?.message;
}
