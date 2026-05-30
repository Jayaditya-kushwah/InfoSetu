#!/usr/bin/env node
/** Run: npm run check-health — verifies LLM + Supabase setup */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const content = readFileSync(resolve(process.cwd(), ".env"), "utf8");
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

loadEnv();

console.log("\n🏥 RTI-Ease full health check\n");

try {
  const res = await fetch("http://localhost:3000/api/health");
  const data = await res.json();

  console.log("Backend:", data.backend);
  console.log("Status:", data.summary);
  console.log("");

  const llm = data.llm;
  console.log(`LLM (${llm.provider}): ${llm.ok ? "✅" : "❌"} ${llm.message}`);
  if (llm.model) console.log(`  Model: ${llm.model}`);
  if (llm.tried?.length > 1) {
    for (const attempt of llm.tried) {
      if (attempt.provider !== llm.provider || !llm.ok) {
        console.log(
          `  ↳ ${attempt.provider}: ${attempt.ok ? "✅" : "❌"} ${attempt.message}`
        );
      }
    }
  }

  const db = data.supabase;
  console.log(`Supabase: ${db.ok ? "✅" : "❌"} ${db.message}`);
  if (db.url) console.log(`  URL: ${db.url}`);

  console.log("");

  if (!db.ok) {
    console.log("⚠️  YOU DO EXTERNALLY — Database:");
    console.log("  1. https://supabase.com/dashboard → your project → SQL Editor");
    console.log("  2. Paste and run the file: supabase/setup.sql");
    console.log("  3. Restart: npm run dev\n");
  }

  if (!llm.ok) {
    const hasGroq = Boolean(process.env.GROQ_API_KEY?.trim());
    console.log("⚠️  YOU DO EXTERNALLY — AI (one-time, ~2 min):");
    if (!hasGroq) {
      console.log("  1. Open https://console.groq.com/keys");
      console.log("  2. Create API Key (starts with gsk_)");
      console.log("  3. Add to .env:");
      console.log("       LLM_PROVIDER=groq");
      console.log("       GROQ_API_KEY=gsk_your_key_here");
      console.log("  4. Restart: npm run dev");
      console.log("  5. Re-run: npm run check-health\n");
    } else {
      console.log("  Groq key is set but failing — create a new key at console.groq.com/keys\n");
    }
  }

  if (data.ok && data.aiReady) {
    console.log("✅ Everything is configured. Open http://localhost:3000\n");
    process.exit(0);
  }

  if (data.ok) {
    console.log("✅ App is usable (database + offline drafts). Add Groq key for AI drafts.\n");
    console.log("   Open http://localhost:3000\n");
    process.exit(0);
  }

  process.exit(1);
} catch {
  console.error("❌ Could not reach http://localhost:3000/api/health");
  console.log("\nStart dev server first: npm run dev\n");
  process.exit(1);
}
