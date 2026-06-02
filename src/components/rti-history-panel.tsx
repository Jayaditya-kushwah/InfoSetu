"use client";

import { History } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { RTISearchPanel } from "@/components/rti-search-panel";
import type { RTIRecord, UserDetail } from "@/lib/user-types";
import { RTI_CATEGORY_LABELS, type RTICategory } from "@/lib/rti-categories";
import { getStoredUserId } from "@/lib/user-session";

interface RTIHistoryPanelProps {
  profiles: UserDetail[];
  refreshKey?: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RTIHistoryPanel({ profiles, refreshKey = 0 }: RTIHistoryPanelProps) {
  const [records, setRecords] = useState<RTIRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    const userId = getStoredUserId();
    if (!userId) {
      setRecords([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/user/rti-history?user_id=${encodeURIComponent(userId)}`
      );
      const data = (await response.json()) as
        | { records: RTIRecord[] }
        | { error: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Failed to load history");
      }

      setRecords("records" in data ? data.records : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory, refreshKey]);

  const profileName = (detailId: string | null) => {
    if (!detailId) return "Unknown profile";
    return (
      profiles.find((profile) => profile.id === detailId)?.full_name ??
      "Deleted profile"
    );
  };

  if (isLoading) {
    return (
      <p className="text-xs text-slate-500">Loading RTI history…</p>
    );
  }

  if (error) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        {error}
      </p>
    );
  }

  if (records.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      {/* Search Panel */}
      <div className="border-b border-slate-100 pb-4">
        <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Search Past RTIs</h3>
        </div>
        <RTISearchPanel />
      </div>

      {/* History List */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Recent RTIs</h3>
        <ul className="max-h-40 space-y-2 overflow-y-auto">
          {records.map((record) => (
            <li
              key={record.id}
              className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700"
            >
              <p className="font-medium text-slate-900">
                {record.target_department ?? "RTI Application"}
              </p>
              <p className="mt-0.5 line-clamp-1">{record.grievance_text}</p>
              <p className="mt-1 text-slate-500">
                {formatDate(record.created_at)} · Profile:{" "}
                {profileName(record.user_detail_id)}
                {record.rti_category &&
                  ` · ${RTI_CATEGORY_LABELS[record.rti_category as RTICategory] ?? record.rti_category}`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
