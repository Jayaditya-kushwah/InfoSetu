import type { UserDetail } from "@/lib/user-types";
import type { RTIDraft } from "@/lib/rti-types";

const PLACEHOLDER_PATTERNS: Array<{ pattern: RegExp; replace: (d: UserDetail) => string }> = [
  { pattern: /\[Applicant Name\]/gi, replace: (d) => d.full_name },
  { pattern: /\[your name\]/gi, replace: (d) => d.full_name },
  { pattern: /\[Complete Postal Address\]/gi, replace: (d) => formatAddress(d) },
  { pattern: /\[your address\]/gi, replace: (d) => formatAddress(d) },
  { pattern: /\[Contact Number\]/gi, replace: (d) => d.phone },
  { pattern: /\[your phone\]/gi, replace: (d) => d.phone },
  { pattern: /\[Email Address\]/gi, replace: (d) => d.email },
  { pattern: /\[your email\]/gi, replace: (d) => d.email },
];

export function formatAddress(detail: UserDetail): string {
  return `${detail.street_address}, ${detail.district}, ${detail.state} ${detail.postal_code}`;
}

export function buildApplicantBlock(detail: UserDetail): string {
  return `${detail.full_name}\n${formatAddress(detail)}\nPhone: ${detail.phone}\nEmail: ${detail.email}`;
}

function replacePlaceholders(text: string, detail: UserDetail): string {
  let result = text;
  for (const { pattern, replace } of PLACEHOLDER_PATTERNS) {
    result = result.replace(pattern, replace(detail));
  }
  return result;
}

export function injectUserDataIntoDraft(
  draft: RTIDraft,
  detail: UserDetail
): RTIDraft {
  return {
    ...draft,
    from: buildApplicantBlock(detail),
    generatedDraft: replacePlaceholders(draft.generatedDraft, detail),
    body: draft.body.map((paragraph) => replacePlaceholders(paragraph, detail)),
    subject: replacePlaceholders(draft.subject, detail),
  };
}
