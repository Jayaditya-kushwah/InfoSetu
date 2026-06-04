"use client";

import { Loader2, MapPin, User } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { InputField } from "@/components/user-detail/input-field";
import { SelectField } from "@/components/user-detail/select-field";
import { Button } from "@/components/ui/button";
import { INDIAN_STATES_AND_UTS, getDistrictsForState } from "@/lib/indian-locations";
import type { UserDetail } from "@/lib/user-types";
import { getStoredUserId, setStoredUserId } from "@/lib/user-session";
import {
  EMPTY_USER_DETAIL_FORM,
  validateUserDetailField,
  validateUserDetailForm,
  type UserDetailField,
} from "@/lib/validation/user-detail-form";
import type { UserDetailFormValues } from "@/lib/validation/user-detail";

interface UserDetailFormProps {
  initialValues?: Partial<UserDetailFormValues>;
  editDetailId?: string;
  submitLabel?: string;
  onSuccess?: (detail: UserDetail, userId: string) => void;
  onCancel?: () => void;
}

export function UserDetailForm({
  initialValues,
  editDetailId,
  submitLabel = "Save Details",
  onSuccess,
  onCancel,
}: UserDetailFormProps) {
  const [values, setValues] = useState<UserDetailFormValues>({
    ...EMPTY_USER_DETAIL_FORM,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Partial<Record<UserDetailField, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<UserDetailField, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const districtOptions = useMemo(
    () => getDistrictsForState(values.state),
    [values.state]
  );

  useEffect(() => {
    if (!values.state || !values.district) return;
    if (!districtOptions.includes(values.district)) {
      setValues((current) => ({ ...current, district: "" }));
    }
  }, [values.state, values.district, districtOptions]);

  const setFieldValue = useCallback((field: UserDetailField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFormError(null);
    setSuccessMessage(null);

    const fieldError = validateUserDetailField(field, value);
    setErrors((current) => ({
      ...current,
      [field]: fieldError,
    }));
  }, []);

  const markTouched = useCallback(
    (field: UserDetailField) => {
      setTouched((current) => ({ ...current, [field]: true }));
      setErrors((current) => ({
        ...current,
        [field]: validateUserDetailField(field, values[field]),
      }));
    },
    [values]
  );

  const visibleError = useCallback(
    (field: UserDetailField) =>
      touched[field] || isSubmitting ? errors[field] : undefined,
    [touched, isSubmitting, errors]
  );

  const handlePhoneChange = useCallback(
    (value: string) => {
      setFieldValue("phone", value.replace(/\D/g, "").slice(0, 10));
    },
    [setFieldValue]
  );

  const handlePostalChange = useCallback(
    (value: string) => {
      setFieldValue("postal_code", value.replace(/\D/g, "").slice(0, 6));
    },
    [setFieldValue]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const nextErrors = validateUserDetailForm(values);
    setErrors(nextErrors);
    setTouched({
      full_name: true,
      email: true,
      phone: true,
      street_address: true,
      state: true,
      district: true,
      postal_code: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = getStoredUserId();
      const isEdit = Boolean(editDetailId && userId);

      const response = await fetch(
        isEdit ? `/api/user/details/${editDetailId}` : "/api/user/create-detail",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            user_id: userId ?? undefined,
            set_active: isEdit ? undefined : true,
          }),
        }
      );

      const data = (await response.json()) as
        | {
            detail: UserDetail;
            user_id?: string;
            message: string;
          }
        | { error: string; fieldErrors?: Record<string, string> };

      if (!response.ok) {
        if ("fieldErrors" in data && data.fieldErrors) {
          setErrors(data.fieldErrors as Partial<Record<UserDetailField, string>>);
        }
        throw new Error("error" in data ? data.error : "Failed to save user details");
      }

      const successData = data as {
        detail: UserDetail;
        user_id?: string;
        message: string;
      };
      const resolvedUserId = successData.user_id ?? userId;
      if (resolvedUserId) {
        setStoredUserId(resolvedUserId);
      }
      setSuccessMessage(successData.message);
      onSuccess?.(successData.detail, resolvedUserId ?? "");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to save user details"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <User className="h-4 w-4 text-blue-700" />
          <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <InputField
              id="full_name"
              label="Full Name"
              value={values.full_name}
              onChange={(value) => setFieldValue("full_name", value)}
              onBlur={() => markTouched("full_name")}
              error={visibleError("full_name")}
              hint="Legal name as it should appear on the RTI"
              placeholder="e.g. Rajesh Kumar Sharma"
            />
          </div>
          <InputField
            id="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={(value) => setFieldValue("email", value)}
            onBlur={() => markTouched("email")}
            error={visibleError("email")}
            hint="RTI office may send acknowledgements here"
            placeholder="you@example.com"
          />
          <InputField
            id="phone"
            label="Phone"
            type="tel"
            inputMode="numeric"
            value={values.phone}
            onChange={handlePhoneChange}
            onBlur={() => markTouched("phone")}
            error={visibleError("phone")}
            hint="10-digit Indian mobile number"
            placeholder="9876543210"
            maxLength={10}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <MapPin className="h-4 w-4 text-blue-700" />
          <h3 className="text-sm font-semibold text-slate-900">Address Information</h3>
        </div>
        <InputField
          id="street_address"
          label="Street Address"
          value={values.street_address}
          onChange={(value) => setFieldValue("street_address", value)}
          onBlur={() => markTouched("street_address")}
          error={visibleError("street_address")}
          hint="House/flat number, street, locality"
          placeholder="123 Main Street, Koramangala"
          multiline
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="state"
            label="State / UT"
            value={values.state}
            onChange={(value) => {
              setValues((current) => ({
                ...current,
                state: value,
                district: "",
              }));
              setFormError(null);
              setSuccessMessage(null);
              setErrors((current) => ({
                ...current,
                state: validateUserDetailField("state", value),
                district: undefined,
              }));
            }}
            onBlur={() => markTouched("state")}
            options={INDIAN_STATES_AND_UTS}
            placeholder="Select state or UT"
            error={visibleError("state")}
          />
          <SelectField
            id="district"
            label="District"
            value={values.district}
            onChange={(value) => setFieldValue("district", value)}
            onBlur={() => markTouched("district")}
            options={districtOptions}
            placeholder={values.state ? "Select district" : "Select state first"}
            error={visibleError("district")}
            disabled={!values.state}
            hint={
              values.state ? `${districtOptions.length} districts available` : undefined
            }
          />
          <InputField
            id="postal_code"
            label="Postal Code (PIN)"
            value={values.postal_code}
            onChange={handlePostalChange}
            onBlur={() => markTouched("postal_code")}
            error={visibleError("postal_code")}
            hint="6-digit Indian PIN code"
            placeholder="560001"
            inputMode="numeric"
            maxLength={6}
          />
        </div>
      </section>

      {formError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      {successMessage && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {successMessage}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-700 hover:bg-blue-800"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
