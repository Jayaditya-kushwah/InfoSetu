/**
 * Phase 0: Safety Baseline - Regression Test Checklist
 * 
 * This file documents the baseline behavior that must remain unchanged.
 * Run these checks manually and via automated tests after each phase.
 * 
 * PHASE 0 BASELINE SNAPSHOT (May 31, 2026)
 * - Build: ✅ Passes (next build)
 * - Tests: ✅ 34 tests pass (vitest)
 * - Core Features Verified:
 *   1. User profile creation & selection
 *   2. RTI generation from plain language
 *   3. Department routing/categorization
 *   4. PDF export functionality
 *   5. Adaptive questionnaire flow
 *   6. RTI history tracking
 */

export const REGRESSION_CHECKLIST = {
  // Phase 0: Baseline
  baseline: {
    // Build & Tests
    buildPasses: "npm run build completes without errors",
    testsPasses: "npm test passes all 34 tests",

    // Core RTI Generation Flow
    grievanceInput:
      "User can input plain language grievance (English or Hindi)",
    departmentDetection:
      "System auto-detects department from grievance (e.g., roads → PWD)",
    categoryDetection:
      "System auto-detects RTI category (e.g., infrastructure)",
    adaptiveQuestionnaire:
      "Category-specific follow-up questions display based on grievance type",
    rtiConfirmation:
      "User can review RTI details before generation (name, email, address)",
    rtiGeneration:
      "LLM generates legally compliant RTI draft from grievance + answers",
    pdfExport: "User can download generated RTI as PDF with proper formatting",

    // User Profile Management
    profileCreation:
      "New users can create first profile with name, email, phone, address, state, district, PIN",
    profileCard: "Saved profiles appear as selectable cards",
    profileSwitch: "User can switch between multiple profiles",
    profileEdit: "User can edit existing profile details",
    profileDelete: "User can delete profile (with confirmation)",
    profilePersistence:
      "Profile data persists across sessions (Supabase storage)",

    // History & Tracking
    historyPanel:
      "Past RTIs appear in 'Past RTIs' panel with metadata (date, dept, category)",
    historyPersistence:
      "RTI history persists across sessions and page reloads",

    // LLM Integration
    llmFallback:
      "If primary LLM fails, system attempts alternate provider (Groq ↔ Gemini)",
    llmErrorHandling:
      "User sees helpful error message if all LLM providers fail",

    // UI/UX
    noJSErrors: "No JavaScript errors in browser console during normal usage",
    responsiveDesign: "UI renders correctly on desktop (1920px) and mobile (375px)",
    accessibility: "Tab navigation works; ARIA labels present",
  },

  // Phase 1: Quick Wins (no regression)
  phase1: {
    phase0Maintained:
      "All Phase 0 checks still pass (with new features disabled)",
    newFeaturesOptional:
      "New Phase 1 features do not interfere with existing flow when disabled",
  },

  // Feature Flag Verification
  featureFlags: {
    allDisabled:
      "System works correctly when all feature flags are set to false",
    flagsIndependent:
      "Each feature flag can be toggled independently without affecting others",
  },
};

/**
 * Manual Regression Checklist for QA
 * Run before and after each phase deployment
 */
export const MANUAL_REGRESSION_STEPS = [
  {
    step: 1,
    action: "Open http://localhost:3000 in fresh incognito window",
    expected:
      "Dashboard loads, onboarding form visible if first visit, no errors in console",
  },
  {
    step: 2,
    action: 'Enter profile details (Name: Test User, Email: test@example.com, Phone: 9876543210, Address: "Test Lane", State: Maharashtra, District: Pune, PIN: 411001)',
    expected: "Profile saved, card appears in top section",
  },
  {
    step: 3,
    action:
      'Enter grievance: "Large potholes on MG Road for 6 months. Want to know action taken and cost."',
    expected:
      "Department detected (PWD), category detected (infrastructure), no errors",
  },
  {
    step: 4,
    action: "Answer adaptive questionnaire questions (if any appear)",
    expected: "Proceed to confirmation screen",
  },
  {
    step: 5,
    action: "Review RTI preview, click 'Confirm & Generate RTI'",
    expected:
      "RTI draft appears in preview panel with proper formatting and user details",
  },
  {
    step: 6,
    action: "Click 'Download RTI as PDF'",
    expected:
      "PDF downloads with filename like RTI_*.pdf, opens correctly in viewer",
  },
  {
    step: 7,
    action:
      "Hard refresh page (Ctrl+Shift+R), create second profile, switch profiles",
    expected:
      "Both profiles visible, can switch and file new RTI with second profile",
  },
  {
    step: 8,
    action:
      "Check 'Past RTIs' panel (if RTIs were previously created in this session)",
    expected: "History shows date, department, category, profile used",
  },
  {
    step: 9,
    action: "Check browser DevTools console",
    expected: "No JavaScript errors, no 404s for API calls",
  },
];

/**
 * Exit Criteria for Phase 0
 */
export const PHASE_0_EXIT_CRITERIA = [
  {
    criterion: "npm run build passes without errors",
    status: "✅ VERIFIED",
    notes: "Build completes successfully (7.0s)",
  },
  {
    criterion: "npm test passes (all 34 tests)",
    status: "✅ VERIFIED",
    notes:
      "5 test files, 34 tests total, no failures; expect same after Phase 1",
  },
  {
    criterion: "Core RTI generation flow unchanged with feature flags OFF",
    status: "⏳ PENDING",
    notes:
      "Manual verification needed after implementing Phase 0 feature flag system",
  },
  {
    criterion: "Current user flow works with all new flags OFF",
    status: "⏳ PENDING",
    notes:
      "Run manual regression checklist with all Phase 1+ flags disabled",
  },
  {
    criterion: "Existing tests still pass after Phase 1 implementation",
    status: "⏳ PENDING",
    notes: "Re-run npm test after Phase 1 code added",
  },
];
