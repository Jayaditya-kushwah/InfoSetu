"use client";

import { Plus } from "lucide-react";

import { UserProfileCard } from "@/components/user-detail/user-profile-card";
import { Button } from "@/components/ui/button";
import type { UserDetail } from "@/lib/user-types";

interface ProfileCardsRowProps {
  profiles: UserDetail[];
  activeProfileId: string | null;
  onSelect: (profile: UserDetail) => void;
  onEdit: (profile: UserDetail) => void;
  onDelete: (profile: UserDetail) => void;
  onAddNew: () => void;
}

export function ProfileCardsRow({
  profiles,
  activeProfileId,
  onSelect,
  onEdit,
  onDelete,
  onAddNew,
}: ProfileCardsRowProps) {
  if (profiles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm text-slate-600">
          No saved profiles yet. Add your details to auto-fill RTI forms.
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-3 bg-blue-700 hover:bg-blue-800"
          onClick={onAddNew}
        >
          <Plus />
          Add Details
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-800">Your Profiles</p>
        <Button type="button" variant="outline" size="sm" onClick={onAddNew}>
          <Plus />
          New Profile
        </Button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:thin]">
        {profiles.map((profile) => (
          <UserProfileCard
            key={profile.id}
            profile={profile}
            isActive={profile.id === activeProfileId}
            onSelect={() => onSelect(profile)}
            onEdit={() => onEdit(profile)}
            onDelete={() => onDelete(profile)}
          />
        ))}
      </div>
    </div>
  );
}
