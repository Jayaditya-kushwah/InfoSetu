"use client";

import { UserCircle2, X } from "lucide-react";
import { useCallback, useEffect } from "react";

import { UserDetailForm } from "@/components/user-detail/user-detail-form";
import type { UserDetail } from "@/lib/user-types";

interface UserDetailFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (detail: UserDetail, userId: string) => void;
  title?: string;
  description?: string;
  initialValues?: Partial<{
    full_name: string;
    email: string;
    phone: string;
    street_address: string;
    state: string;
    district: string;
    postal_code: string;
  }>;
  submitLabel?: string;
  dismissible?: boolean;
  editDetailId?: string;
}

export function UserDetailFormModal({
  open,
  onClose,
  onSuccess,
  title = "Save Your Details",
  description = "Enter your details once — we will auto-fill them in every RTI you file.",
  initialValues,
  submitLabel,
  dismissible = true,
  editDetailId,
}: UserDetailFormModalProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        onClose();
      }
    },
    [dismissible, onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const handleSuccess = (detail: UserDetail, userId: string) => {
    onSuccess?.(detail, userId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-detail-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
        aria-label="Close dialog"
        onClick={dismissible ? onClose : undefined}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="user-detail-modal-title"
                className="text-lg font-semibold text-slate-900"
              >
                {title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          <UserDetailForm
            initialValues={initialValues}
            editDetailId={editDetailId}
            submitLabel={submitLabel}
            onSuccess={handleSuccess}
            onCancel={dismissible ? onClose : undefined}
          />
        </div>
      </div>
    </div>
  );
}
