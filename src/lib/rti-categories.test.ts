import { describe, expect, it } from "vitest";

import {
  detectRTICategory,
  getVisibleFields,
  validateCategoryAnswers,
} from "@/lib/rti-categories";

describe("detectRTICategory", () => {
  it("detects infrastructure complaints about roads", () => {
    expect(
      detectRTICategory(
        "Large potholes on MG Road for 6 months, no repair done by municipal corporation"
      )
    ).toBe("infrastructure_complaint");
  });

  it("detects environmental issues", () => {
    expect(
      detectRTICategory(
        "Factory releasing toxic smoke and polluting the air in our neighborhood"
      )
    ).toBe("environmental_issue");
  });

  it("detects transparency issues", () => {
    expect(
      detectRTICategory(
        "Provide copies of tender documents and expenditure records for road project"
      )
    ).toBe("transparency_issue");
  });
});

describe("getVisibleFields", () => {
  it("shows conditional road field when issue type is road damage", () => {
    const fields = getVisibleFields("infrastructure_complaint", {
      issue_type: "Road damage",
    });
    expect(fields.some((field) => field.id === "road_number")).toBe(true);
  });

  it("hides conditional road field for other issue types", () => {
    const fields = getVisibleFields("infrastructure_complaint", {
      issue_type: "Drainage",
    });
    expect(fields.some((field) => field.id === "road_number")).toBe(false);
  });
});

describe("validateCategoryAnswers", () => {
  it("requires visible mandatory fields", () => {
    const errors = validateCategoryAnswers("transparency_issue", {});
    expect(errors.government_office).toBeTruthy();
    expect(errors.documents_needed).toBeTruthy();
  });
});
