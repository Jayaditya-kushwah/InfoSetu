"use client";

import { useCallback, useEffect, useState } from "react";

import type { UserDetail } from "@/lib/user-types";
import { getStoredUserId, setStoredUserId } from "@/lib/user-session";

interface UseUserProfilesResult {
  userId: string | null;
  profiles: UserDetail[];
  activeProfile: UserDetail | null;
  selectedProfile: UserDetail | null;
  isLoading: boolean;
  error: string | null;
  refreshProfiles: () => Promise<void>;
  selectProfile: (profile: UserDetail) => Promise<void>;
  deleteProfile: (profile: UserDetail) => Promise<void>;
  setSelectedProfile: (profile: UserDetail | null) => void;
}

export function useUserProfiles(): UseUserProfilesResult {
  const [userId, setUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<UserDetail[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfiles = useCallback(async () => {
    const storedUserId = getStoredUserId();
    setUserId(storedUserId);

    if (!storedUserId) {
      setProfiles([]);
      setSelectedProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/user/details?user_id=${encodeURIComponent(storedUserId)}`
      );
      const data = (await response.json()) as
        | { details: UserDetail[]; user_id: string }
        | { error: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Failed to load user profiles");
      }

      if ("user_id" in data) {
        setStoredUserId(data.user_id);
        setUserId(data.user_id);
      }

      const nextProfiles = "details" in data ? data.details : [];
      setProfiles(nextProfiles);

      setSelectedProfile((current) => {
        if (current && nextProfiles.some((profile) => profile.id === current.id)) {
          return nextProfiles.find((profile) => profile.id === current.id) ?? current;
        }
        return (
          nextProfiles.find((profile) => profile.is_active) ?? nextProfiles[0] ?? null
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profiles");
      setProfiles([]);
      setSelectedProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfiles();
  }, [refreshProfiles]);

  const activeProfile =
    profiles.find((profile) => profile.is_active) ?? profiles[0] ?? null;

  const selectProfile = useCallback(
    async (profile: UserDetail) => {
      const storedUserId = getStoredUserId();
      if (!storedUserId) return;

      const response = await fetch(`/api/user/details/${profile.id}/set-active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: storedUserId }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to select profile");
      }

      setSelectedProfile(profile);
      await refreshProfiles();
    },
    [refreshProfiles]
  );

  const deleteProfile = useCallback(
    async (profile: UserDetail) => {
      const storedUserId = getStoredUserId();
      if (!storedUserId) return;

      const confirmed = window.confirm(
        `Delete profile for ${profile.full_name}? This cannot be undone.`
      );
      if (!confirmed) return;

      const response = await fetch(
        `/api/user/details/${profile.id}?user_id=${encodeURIComponent(storedUserId)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to delete profile");
      }

      await refreshProfiles();
    },
    [refreshProfiles]
  );

  return {
    userId,
    profiles,
    activeProfile,
    selectedProfile: selectedProfile ?? activeProfile,
    isLoading,
    error,
    refreshProfiles,
    selectProfile,
    deleteProfile,
    setSelectedProfile,
  };
}
