"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserDetail } from "@/lib/user-types";
import { formatAddress } from "@/lib/rti-template";

interface RTIConfirmScreenProps {
  profile: UserDetail;
  onEdit: () => void;
  onConfirm: () => void;
  isConfirming?: boolean;
}

export function RTIConfirmScreen({
  profile,
  onEdit,
  onConfirm,
  isConfirming = false,
}: RTIConfirmScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
          Confirm RTI Details
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          Is this information correct?
        </h3>
      </div>
      <ul className="space-y-2 text-sm text-slate-800">
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Filing as:</strong> {profile.full_name}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Email:</strong> {profile.email}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Phone:</strong> {profile.phone}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Address:</strong> {formatAddress(profile)}
          </span>
        </li>
      </ul>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          Edit Details
        </Button>
        <Button
          type="button"
          size="sm"
          className="bg-emerald-700 hover:bg-emerald-800"
          disabled={isConfirming}
          onClick={onConfirm}
        >
          {isConfirming ? (
            <>
              <Loader2 className="animate-spin" />
              Generating…
            </>
          ) : (
            "Confirm & Generate RTI"
          )}
        </Button>
      </div>
    </div>
  );
}
