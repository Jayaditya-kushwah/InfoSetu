# RTI-Ease — External Setup (things only you can do)

Everything else is handled by the Next.js app. You only need to complete these **one-time** steps in your browser.

---

## ✅ Already done (based on health check)

- [x] Next.js app running (`npm run dev`)
- [x] Supabase connected
- [x] `rti_applications` table exists
- [x] PDF download working

---

## 👤 Step 0 — User profile tables (Feature 1)

Run this **once** in Supabase Dashboard → SQL Editor (after `supabase/setup.sql`):

```sql
-- Paste contents of supabase/user-profiles.sql and Run
```

This creates `users`, `user_details`, `rti_records`, and `detail_usage_history` with RLS policies.

Then run `supabase/rti-adaptive.sql` for RTI-specific questionnaire storage (Features 3–5).

Verify:

```bash
npm run check-health
```

Look for `userProfiles: { ok: true, ... }` in the JSON output.

Test the new API (with dev server running):

```bash
curl -s -X POST http://localhost:3000/api/user/create-detail \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "street_address": "123 Test Street, Bangalore",
    "state": "Karnataka",
    "district": "Bengaluru Urban",
    "postal_code": "560001"
  }' | jq

# Use the user_id from the response:
curl -s "http://localhost:3000/api/user/details?user_id=PASTE_USER_ID" | jq
```

Run unit tests:

```bash
npm install
npm test
```

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
