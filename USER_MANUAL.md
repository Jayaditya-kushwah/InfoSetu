# RTI-Ease User Manual

Welcome to RTI-Ease! Follow these steps to generate an official RTI application draft, with your details auto-filled for every filing.

## Step-by-Step Guide

### Step 0 (First time only): Save Your Details

- When you open RTI-Ease for the first time, you will see **“Welcome — Save Your Details”**.
- Enter your **Full Name, Email, Phone, Address, State/UT, District, and PIN code**.
- Click **“Save & Continue”**.

Your details are saved as a **profile** and will be reused for future RTIs.

### Step 1: Choose or Add a Profile

- At the top of the page you’ll see **profile cards** (your saved profiles).
- Click a card to select it (the selected profile becomes active).
- Use **New Profile** to add another profile (e.g., home vs office, family member).
- Use **Edit** to update a profile or **Delete** to remove a profile.

### Step 2: Input Your Grievance

- In the **Your Grievance** text area, describe your civic issue in plain language.
- Example:
  - “Large potholes on MG Road for 6 months. Multiple complaints unanswered. I want details of repairs and expenditure.”

### Step 3: Answer RTI-Specific Questions (Adaptive Questionnaire)

- RTI-Ease detects the RTI category (e.g., infrastructure, environment, transparency).
- You will be shown a short **RTI-specific details** form with only relevant questions.
- Click **Continue** to proceed (your answers are saved and will pre-fill next time).

### Step 4: Confirm Your Details

- You’ll see **Confirm RTI Details** with the selected profile’s name, email, phone, and address.
- Click **Edit Details** if anything is wrong.
- Click **Confirm & Generate RTI** to generate the final RTI draft.

### Step 5: Review the RTI Preview and Download PDF

- The **Official RTI Preview** panel shows the generated RTI with your real details (no placeholders).
- Click **Download RTI as PDF** to save a ready-to-print document.

## Past RTIs (History)

- If you have generated RTIs before, a **Past RTIs** panel appears.
- It shows when each RTI was generated, the department, the profile used, and the RTI category.

## Tips & Troubleshooting

- **If you see “Could not find the table 'public.users'…”**: Run `supabase/user-profiles.sql` (and `supabase/rti-adaptive.sql`) in Supabase SQL Editor, then reload.
- **Phone format**: Enter a 10-digit Indian mobile number (digits only).
