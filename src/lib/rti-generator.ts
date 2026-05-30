export interface RTIDraft {
  subject: string;
  to: string;
  from: string;
  date: string;
  body: string[];
  department: string;
  feeNote: string;
}

function extractSubject(grievance: string): string {
  const trimmed = grievance.trim();
  if (trimmed.length <= 80) return trimmed;
  const firstSentence = trimmed.split(/[.!?।]/)[0]?.trim();
  return firstSentence && firstSentence.length > 10
    ? firstSentence.slice(0, 120)
    : trimmed.slice(0, 120);
}

function detectDepartment(grievance: string): string {
  const lower = grievance.toLowerCase();
  const hindiRoad =
    /सड़क|रोड|गड्ढ|footpath|pothole|road|street|highway|bridge/.test(
      lower + grievance
    );
  const water =
    /water|पानी|jal|supply|pipeline|sewer|drainage|नाल/.test(
      lower + grievance
    );
  const education =
    /school|शिक्ष|college|university|teacher|mid-day meal/.test(
      lower + grievance
    );
  const health =
    /hospital|health|doctor|ambulance|आरोग्य|चिकित्स/.test(
      lower + grievance
    );
  const environment =
    /pollution|environment|tree|forest|waste|garbage|कचर|प्रदूष/.test(
      lower + grievance
    );
  const budget =
    /budget|fund|expenditure|audit|corruption|bribe|घोटाल|भ्रष्ट/.test(
      lower + grievance
    );

  if (hindiRoad)
    return "Public Works Department / Municipal Corporation — Roads & Infrastructure";
  if (water)
    return "Jal Board / Municipal Water Supply Department";
  if (education)
    return "Department of Education / District Education Officer";
  if (health)
    return "Department of Health & Family Welfare";
  if (environment)
    return "State Pollution Control Board / Municipal Sanitation Department";
  if (budget)
    return "Finance Department / Comptroller & Auditor General (CAG) — relevant wing";
  return "Public Information Officer — concerned Administrative Department";
}

function buildQuestions(grievance: string): string[] {
  const subject = extractSubject(grievance);
  const department = detectDepartment(grievance);

  return [
    `Provide complete details of all actions taken by your department regarding: "${subject}".`,
    `Provide copies of all correspondence, file notings, and orders issued in connection with the above matter from 1 January 2020 to date.`,
    `Provide the names, designations, and contact details of all officers who have handled this matter at each stage of processing.`,
    `Provide a certified copy of the budget allocation, expenditure statements, and utilisation certificates related to this subject for the last three financial years.`,
    `Provide copies of all inspection reports, survey reports, and compliance records maintained by ${department} pertaining to this issue.`,
    `If any information is denied, please cite the specific exemption clause under Section 8 or 9 of the RTI Act, 2005, along with justification.`,
  ];
}

export function generateRTIDraft(grievance: string): RTIDraft {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const subject = extractSubject(grievance);
  const department = detectDepartment(grievance);
  const questions = buildQuestions(grievance);

  return {
    subject: `Request for Information under RTI Act, 2005 — ${subject}`,
    to: `The Public Information Officer\n${department}\nGovernment of India / State Government\n[Office Address]`,
    from: "[Applicant Name]\n[Complete Postal Address]\n[Contact Number]\n[Email Address]",
    date: today,
    department,
    body: [
      "Sir/Madam,",
      "",
      "Under the provisions of the Right to Information Act, 2005 (Act No. 22 of 2005), I hereby submit this application seeking the following information:",
      "",
      ...questions.flatMap((q, i) => [`${i + 1}. ${q}`, ""]),
      "I declare that I am a citizen of India. I am ready to pay the prescribed application fee of ₹10/- (Rupees Ten only) as per the RTI Rules applicable to this public authority.",
      "",
      "Kindly provide the information in English/Hindi within the statutory period of 30 days as mandated under Section 7(1) of the RTI Act, 2005.",
      "",
      "Thanking you,",
      "",
      "Yours faithfully,",
      "",
      "[Applicant Signature]",
      "[Applicant Name]",
    ],
    feeNote:
      "Application fee: ₹10/- (Cash/DD/IPO as per applicable RTI Rules). BPL applicants may attach proof for fee exemption under Section 7(1) proviso.",
  };
}
