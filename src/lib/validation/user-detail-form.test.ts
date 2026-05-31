import { describe, expect, it } from "vitest";

import {
  INDIAN_STATES_AND_UTS,
  getDistrictsForState,
  isValidIndianState,
} from "@/lib/indian-locations";
import {
  EMPTY_USER_DETAIL_FORM,
  validateUserDetailField,
  validateUserDetailForm,
} from "@/lib/validation/user-detail-form";

describe("INDIAN_STATES_AND_UTS", () => {
  it("includes 28 states and 8 union territories", () => {
    expect(INDIAN_STATES_AND_UTS).toHaveLength(36);
  });

  it("includes Karnataka and Delhi", () => {
    expect(INDIAN_STATES_AND_UTS).toContain("Karnataka");
    expect(INDIAN_STATES_AND_UTS).toContain("Delhi");
  });
});

describe("getDistrictsForState", () => {
  it("returns districts for a valid state", () => {
    const districts = getDistrictsForState("Karnataka");
    expect(districts).toContain("Bengaluru Urban");
    expect(districts.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown state", () => {
    expect(getDistrictsForState("Invalid State")).toEqual([]);
  });
});

describe("isValidIndianState", () => {
  it("validates known states", () => {
    expect(isValidIndianState("Maharashtra")).toBe(true);
    expect(isValidIndianState("Fake State")).toBe(false);
  });
});

describe("validateUserDetailField", () => {
  it("validates phone in real time", () => {
    expect(validateUserDetailField("phone", "9876543210")).toBeUndefined();
    expect(validateUserDetailField("phone", "123")).toBeTruthy();
  });

  it("validates postal code in real time", () => {
    expect(validateUserDetailField("postal_code", "560001")).toBeUndefined();
    expect(validateUserDetailField("postal_code", "5600")).toBeTruthy();
  });
});

describe("validateUserDetailForm", () => {
  it("returns no errors for valid form", () => {
    const errors = validateUserDetailForm({
      ...EMPTY_USER_DETAIL_FORM,
      full_name: "Jane Doe",
      email: "jane@example.com",
      phone: "9876543210",
      street_address: "123 Main Street, Bangalore",
      state: "Karnataka",
      district: "Bengaluru Urban",
      postal_code: "560001",
    });
    expect(errors).toEqual({});
  });

  it("returns errors for empty form", () => {
    const errors = validateUserDetailForm(EMPTY_USER_DETAIL_FORM);
    expect(Object.keys(errors).length).toBeGreaterThan(0);
  });
});
