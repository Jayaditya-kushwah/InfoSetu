#!/usr/bin/env node
/**
 * Run: npm run check-api
 * Verifies your LLM API key (Gemini or Groq).
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    console.error("❌ No .env file found.");
    process.exit(1);
  }
}

function isValidGeminiKey(key) {
  return key.startsWith("AIza") || key.startsWith("AQ.");
}

loadEnv();

const provider = (process.env.LLM_PROVIDER ?? "gemini").toLowerCase();

console.log(`\n🔍 RTI-Ease API check (provider: ${provider})\n`);

if (provider === "groq") {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) {
    console.error("❌ GROQ_API_KEY is missing in .env");
    console.log("\nFix:");
    console.log("  1. Go to https://console.groq.com/keys");
    console.log("  2. Create a free API key (starts with gsk_)");
    console.log("  3. Add to .env:");
    console.log("       LLM_PROVIDER=groq");
    console.log("       GROQ_API_KEY=gsk_...");
    console.log("  4. Restart: npm run dev\n");
    process.exit(1);
  }
  console.log("✅ GROQ_API_KEY found");
} else {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    console.error("❌ GEMINI_API_KEY is missing in .env");
    console.log("\nFix:");
    console.log("  1. Go to https://aistudio.google.com/apikey");
    console.log("  2. Create API key (AIza… or AQ.… format — both valid)");
    console.log("  3. Add to .env:  GEMINI_API_KEY=...");
    console.log("  4. Restart: npm run dev\n");
    process.exit(1);
  }
  if (!isValidGeminiKey(key)) {
    console.warn("⚠️  Key format unusual — expected AIza… or AQ.…");
  } else {
    console.log(`✅ Key format OK (${key.startsWith("AQ.") ? "AQ. (new format)" : "AIza (legacy)"})`);
  }
}

console.log("⏳ Testing API via http://localhost:3000/api/generate-rti ...\n");

try {
  const res = await fetch("http://localhost:3000/api/generate-rti", {
    method: "GET",
  });
  const data = await res.json();

  if (data.ok) {
    console.log(`✅ ${data.message} (model: ${data.model ?? "n/a"})`);
    console.log("\nYou're good to go — open http://localhost:3000\n");
    process.exit(0);
  }

  console.error(`❌ ${data.message}`);

  if (provider === "gemini") {
    console.log("\n💡 Gemini quota exhausted? Try Groq (free):");
    console.log("  1. https://console.groq.com/keys");
    console.log("  2. Add to .env:");
    console.log("       LLM_PROVIDER=groq");
    console.log("       GROQ_API_KEY=gsk_...");
    console.log("  3. Restart npm run dev\n");
  }
} catch {
  console.error("❌ Could not reach http://localhost:3000");
  console.log("\nStart the dev server first: npm run dev");
  console.log("Then run: npm run check-api\n");
  process.exit(1);
}

process.exit(1);
