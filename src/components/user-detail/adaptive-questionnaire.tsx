"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { InputField } from "@/components/user-detail/input-field";
import { SelectField } from "@/components/user-detail/select-field";
import { Button } from "@/components/ui/button";
import {
  RTI_CATEGORY_LABELS,
  type RTICategory,
  type RTIFormField,
  getVisibleFields,
  validateCategoryAnswers,
} from "@/lib/rti-categories";
import { getStoredUserId } from "@/lib/user-session";

interface AdaptiveQuestionnaireProps {
  category: RTICategory;
  initialAnswers?: Record<string, string>;
  onSubmit: (answers: Record<string, string>) => void;
  onSkip?: () => void;
}

export function AdaptiveQuestionnaire({
  category,
  initialAnswers = {},
  onSubmit,
  onSkip,
}: AdaptiveQuestionnaireProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAnswers(initialAnswers);
  }, [category, initialAnswers]);

  const visibleFields = useMemo(
    () => getVisibleFields(category, answers),
    [category, answers]
  );

  const setAnswer = useCallback((fieldId: string, value: string) => {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  }, []);

  const renderField = (field: RTIFormField) => {
    if (field.type === "select") {
      return (
        <SelectField
          key={field.id}
          id={field.id}
          label={field.label}
          value={answers[field.id] ?? ""}
          onChange={(value) => setAnswer(field.id, value)}
          options={field.options ?? []}
          placeholder="Select an option"
          error={errors[field.id]}
          hint={field.hint}
        />
      );
    }

    if (field.type === "date") {
      return (
        <InputField
          key={field.id}
          id={field.id}
          label={field.label}
          type="text"
          value={answers[field.id] ?? ""}
          onChange={(value) => setAnswer(field.id, value)}
          error={errors[field.id]}
          hint={field.hint ?? "YYYY-MM-DD or descriptive date"}
          placeholder="2026-01-15"
        />
      );
    }

    return (
      <InputField
        key={field.id}
        id={field.id}
        label={field.label}
        value={answers[field.id] ?? ""}
        onChange={(value) => setAnswer(field.id, value)}
        error={errors[field.id]}
        hint={field.hint}
        placeholder={field.placeholder}
        multiline={field.type === "textarea"}
      />
    );
  };

  const handleSubmit = async () => {
    const nextErrors = validateCategoryAnswers(category, answers);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      const userId = getStoredUserId();
      if (userId) {
        await fetch("/api/user/rti-specific", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            rti_category: category,
            answers,
          }),
        });
      }
      onSubmit(answers);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-violet-100 bg-violet-50/40 p-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-violet-700">
          RTI-specific details
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          {RTI_CATEGORY_LABELS[category]}
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          Answer only what applies to your grievance. Saved answers pre-fill next time.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {visibleFields.map((field) => (
          <div
            key={field.id}
            className={field.type === "textarea" ? "sm:col-span-2" : undefined}
          >
            {renderField(field)}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        {onSkip && (
          <Button type="button" variant="outline" size="sm" onClick={onSkip}>
            Skip
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          className="bg-violet-700 hover:bg-violet-800"
          disabled={isSaving}
          onClick={() => void handleSubmit()}
        >
          {isSaving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
