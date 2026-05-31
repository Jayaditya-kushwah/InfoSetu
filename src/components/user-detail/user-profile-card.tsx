"use client";

import { Mail, MapPin, Pencil, Phone, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserDetail } from "@/lib/user-types";
import { cn } from "@/lib/utils";

interface UserProfileCardProps {
  profile: UserDetail;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function abbreviateAddress(profile: UserDetail): string {
  const line = profile.street_address.split(",")[0]?.trim() ?? profile.street_address;
  return line.length > 32 ? `${line.slice(0, 32)}…` : line;
}

export function UserProfileCard({
  profile,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}: UserProfileCardProps) {
  return (
    <div
      className={cn(
        "flex w-[220px] shrink-0 flex-col rounded-xl border bg-white p-4 shadow-sm transition-all sm:w-[240px]",
        isActive
          ? "border-blue-500 ring-2 ring-blue-100"
          : "border-slate-200 hover:border-slate-300"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 flex-col text-left"
      >
        <div className="flex items-start gap-2">
          {isActive && (
            <span className="mt-0.5 text-sm text-blue-600" aria-hidden>
              ✓
            </span>
          )}
          <p className="line-clamp-1 text-sm font-semibold text-slate-900">
            {profile.full_name}
          </p>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          {profile.phone}
        </p>
        <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-600">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="line-clamp-2">{abbreviateAddress(profile)}</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{profile.email}</span>
        </p>
      </button>
      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 flex-1 text-xs"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 flex-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
