import type { UserDetail } from "@/lib/user-types";
import { buildApplicantBlock } from "@/lib/rti-template";

export interface RTIDraft {
  subject: string;
  to: string;
  from: string;
  date: string;
  body: string[];
  department: string;
  feeNote: string;
  generatedDraft: string;
}

export interface GenerateRTIResponse {
  target_department: string;
  subject: string;
  generated_draft: string;
  body: string[];
}

export function buildDraftFromAIResponse(
  response: GenerateRTIResponse,
  userDetail?: UserDetail
): RTIDraft {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const from = userDetail
    ? buildApplicantBlock(userDetail)
    : "[Applicant Name]\n[Complete Postal Address]\n[Contact Number]\n[Email Address]";

  return {
    subject: response.subject,
    to: `The Public Information Officer\n${response.target_department}\nGovernment of India / State Government\n[Office Address]`,
    from,
    date: today,
    department: response.target_department,
    body: response.body,
    generatedDraft: response.generated_draft,
    feeNote:
      "Application fee: ₹10/- (Cash/DD/IPO as per applicable RTI Rules). BPL applicants may attach proof for fee exemption under Section 7(1) proviso.",
  };
}
