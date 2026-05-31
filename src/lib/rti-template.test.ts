import { describe, expect, it } from "vitest";

import { buildDraftFromAIResponse } from "@/lib/rti-types";
import {
  buildApplicantBlock,
  injectUserDataIntoDraft,
} from "@/lib/rti-template";
import type { UserDetail } from "@/lib/user-types";

const sampleProfile: UserDetail = {
  id: "detail-1",
  user_id: "user-1",
  full_name: "Rajesh Kumar",
  email: "rajesh@example.com",
  phone: "9876543210",
  street_address: "12 MG Road",
  state: "Karnataka",
  district: "Bengaluru Urban",
  postal_code: "560001",
  is_active: true,
  deleted_at: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("buildApplicantBlock", () => {
  it("formats applicant details for RTI header", () => {
    const block = buildApplicantBlock(sampleProfile);
    expect(block).toContain("Rajesh Kumar");
    expect(block).toContain("560001");
    expect(block).toContain("9876543210");
  });
});

describe("injectUserDataIntoDraft", () => {
  it("replaces placeholders with user profile data", () => {
    const draft = buildDraftFromAIResponse({
      target_department: "Municipal Corporation",
      subject: "RTI regarding [Applicant Name]",
      generated_draft:
        "From: [Applicant Name]\nAddress: [Complete Postal Address]\nPhone: [Contact Number]",
      body: ["Request from [Applicant Name] at [your address]"],
    });

    const filled = injectUserDataIntoDraft(draft, sampleProfile);

    expect(filled.from).toContain("Rajesh Kumar");
    expect(filled.generatedDraft).not.toContain("[Applicant Name]");
    expect(filled.generatedDraft).toContain("9876543210");
    expect(filled.body[0]).toContain("Rajesh Kumar");
  });
});
