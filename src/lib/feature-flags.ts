/**
 * Feature Flags for RTI-Ease Phase-wise Rollout
 * Controls feature availability and helps isolate new functionality
 * Reference: Phase 0 - Safety Baseline
 */

export interface FeatureFlags {
  // Phase 1: Quick Wins
  printCss: boolean;
  darkMode: boolean;
  search: boolean;

  // Phase 2: Medium Complexity
  email: boolean;
  templates: boolean;

  // Phase 3: Advanced
  chat: boolean;
  i18n: boolean;
}

export function getFeatureFlags(): FeatureFlags {
  if (typeof window === "undefined") {
    // Server-side (won't have access to NEXT_PUBLIC_* variables during build)
    return {
      printCss: true,
      darkMode: true,
      search: true,
      email: false,
      templates: false,
      chat: false,
      i18n: false,
    };
  }

  // Client-side: read from environment variables
  return {
    // Phase 1
    printCss:
      process.env.NEXT_PUBLIC_ENABLE_PRINT_CSS === "true" ||
      process.env.NEXT_PUBLIC_ENABLE_PRINT_CSS === undefined,
    darkMode:
      process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === "true" ||
      process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === undefined,
    search:
      process.env.NEXT_PUBLIC_ENABLE_SEARCH === "true" ||
      process.env.NEXT_PUBLIC_ENABLE_SEARCH === undefined,

    // Phase 2
    email: process.env.NEXT_PUBLIC_ENABLE_EMAIL === "true",
    templates: process.env.NEXT_PUBLIC_ENABLE_TEMPLATES === "true",

    // Phase 3
    chat: process.env.NEXT_PUBLIC_ENABLE_CHAT === "true",
    i18n: process.env.NEXT_PUBLIC_ENABLE_I18N === "true",
  };
}

/**
 * Returns whether a specific feature is enabled
 * Usage: if (isFeatureEnabled('darkMode')) { ... }
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}
