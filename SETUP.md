# RTI-Ease — External Setup (things only you can do)

Everything else is handled by the Next.js app. You only need to complete these **one-time** steps in your browser.

---

## ✅ Already done (based on health check)

- [x] Next.js app running (`npm run dev`)
- [x] Supabase connected
- [x] `rti_applications` table exists
- [x] PDF download working

---

## 🔑 Step 1 — Get a Groq API key (required for AI drafts)

Gemini free quota is exhausted. Groq is free and takes ~2 minutes.

1. Go to **https://console.groq.com/keys**
2. Sign up / log in (Google or GitHub)
3. Click **Create API Key**
4. Copy the key (starts with `gsk_`)
5. Open `.env` in this project and set:
   ```env
   LLM_PROVIDER=groq
   GROQ_API_KEY=gsk_paste_your_key_here
   ```
6. Restart the dev server:
   ```bash
   # In the terminal running npm run dev, press Ctrl+C, then:
   npm run dev
   ```
7. Verify:
   ```bash
   npm run check-health
   ```
   Expected: `LLM (groq): ✅ Groq API is working.`

---

## 🧪 Step 2 — Test the full app

1. Open **http://localhost:3000**
2. Type a civic grievance (English or Hindi)
3. Click **Generate Legally Binding RTI Draft**
4. Confirm:
   - Draft appears on the right (no yellow offline warning)
   - No red database error
   - **Download RTI as PDF** works
5. Confirm in Supabase:
   - **https://supabase.com/dashboard** → Table Editor → `rti_applications` → new row

---

## ❌ You do NOT need

| Thing | Why |
|-------|-----|
| Separate Python/FastAPI server | Next.js `/api/generate-rti` is the backend |
| New Supabase project | Already connected |
| `AIza` Gemini key | `AQ.` keys are valid; quota is the issue, not the key format |
| Deploy anywhere yet | Local dev is fully functional |

---

## 🆘 If something breaks

```bash
npm run check-health
```

Read the output — it tells you exactly what's wrong and what to fix externally.
