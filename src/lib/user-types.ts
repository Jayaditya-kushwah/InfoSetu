/** Database row types for user profile storage (Feature 1). */

export interface User {
  id: string;
  created_at: string;
}

export interface UserDetail {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  street_address: string;
  state: string;
  district: string;
  postal_code: string;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RTIRecord {
  id: string;
  user_id: string;
  user_detail_id: string | null;
  grievance_text: string;
  rti_content: string;
  target_department: string | null;
  rti_category: string | null;
  created_at: string;
}

export type DetailUsageAction = "created" | "updated" | "deactivated" | "used_in_rti";

export interface DetailUsageHistory {
  id: string;
  user_id: string;
  user_detail_id: string;
  rti_record_id: string | null;
  action: DetailUsageAction;
  created_at: string;
}

/** Payload for creating or updating a user detail profile. */
export interface UserDetailInput {
  full_name: string;
  email: string;
  phone: string;
  street_address: string;
  state: string;
  district: string;
  postal_code: string;
}

export interface CreateUserDetailResult {
  detail: UserDetail;
  user_id: string;
  message: string;
}

export type DbResult<T> = { ok: true; data: T } | { ok: false; error: string };
