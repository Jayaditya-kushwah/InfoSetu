/** RTI category detection and adaptive form templates (Feature 3). */

export const RTI_CATEGORIES = [
  "transparency_issue",
  "personal_information",
  "public_service_complaint",
  "environmental_issue",
  "infrastructure_complaint",
] as const;

export type RTICategory = (typeof RTI_CATEGORIES)[number];

export const RTI_CATEGORY_LABELS: Record<RTICategory, string> = {
  transparency_issue: "Transparency Issue",
  personal_information: "Personal Information Request",
  public_service_complaint: "Public Service Complaint",
  environmental_issue: "Environmental Issue",
  infrastructure_complaint: "Infrastructure / Damage Complaint",
};

export type RTIFieldType = "text" | "textarea" | "select" | "date";

export interface RTIFormField {
  id: string;
  label: string;
  type: RTIFieldType;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  options?: string[];
  /** Show only when another field equals this value. */
  showWhen?: { fieldId: string; equals: string };
}

const CATEGORY_KEYWORDS: Record<RTICategory, string[]> = {
  transparency_issue: [
    "document",
    "record",
    "file",
    "information",
    "transparency",
    "copy of",
    "details of",
    "list of",
    "budget",
    "expenditure",
    "audit",
    "contract",
    "tender",
  ],
  personal_information: [
    "my record",
    "my file",
    "personal",
    "my name",
    "my data",
    "employment",
    "pension",
    "salary",
    "marksheet",
    "certificate",
    "relation",
  ],
  public_service_complaint: [
    "water supply",
    "electricity",
    "power cut",
    "sanitation",
    "garbage",
    "health center",
    "hospital",
    "school",
    "service",
    "complaint",
    "unanswered",
  ],
  environmental_issue: [
    "pollution",
    "factory",
    "smoke",
    "waste",
    "contamination",
    "environment",
    "air quality",
    "water pollution",
    "toxic",
    "effluent",
  ],
  infrastructure_complaint: [
    "road",
    "pothole",
    "bridge",
    "building",
    "damage",
    "collapse",
    "footpath",
    "drain",
    "streetlight",
    "infrastructure",
    "repair",
  ],
};

export function detectRTICategory(grievance: string): RTICategory {
  const text = grievance.toLowerCase();
  let best: RTICategory = "transparency_issue";
  let bestScore = 0;

  for (const category of RTI_CATEGORIES) {
    const score = CATEGORY_KEYWORDS[category].reduce((total, keyword) => {
      return total + (text.includes(keyword) ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }

  return best;
}

export const RTI_FORM_TEMPLATES: Record<RTICategory, RTIFormField[]> = {
  transparency_issue: [
    {
      id: "government_office",
      label: "Which government office?",
      type: "text",
      placeholder: "e.g. Municipal Corporation, Block Office",
      required: true,
    },
    {
      id: "documents_needed",
      label: "Which documents or records do you need?",
      type: "textarea",
      placeholder: "List specific files, registers, or reports",
      required: true,
    },
    {
      id: "reference_numbers",
      label: "Any reference numbers?",
      type: "text",
      placeholder: "File number, RTI ref, complaint ID (if any)",
    },
  ],
  personal_information: [
    {
      id: "relation_to_person",
      label: "Your relation to the person?",
      type: "select",
      options: ["Self", "Parent", "Spouse", "Child", "Legal heir", "Authorized representative"],
      required: true,
    },
    {
      id: "information_type",
      label: "What type of information do you need?",
      type: "textarea",
      required: true,
    },
    {
      id: "id_proof_type",
      label: "ID proof you can provide",
      type: "select",
      options: ["Aadhaar", "Voter ID", "Passport", "PAN", "Other"],
      required: true,
    },
  ],
  public_service_complaint: [
    {
      id: "service_type",
      label: "Which public service?",
      type: "select",
      options: ["Water", "Electricity", "Roads", "Sanitation", "Healthcare", "Education", "Other"],
      required: true,
    },
    {
      id: "issue_date",
      label: "When did the issue occur?",
      type: "date",
      required: true,
    },
    {
      id: "complaint_reference",
      label: "Previous complaint reference (if any)",
      type: "text",
      placeholder: "Complaint ID or date submitted",
    },
    {
      id: "service_subtype",
      label: "Describe the service issue",
      type: "textarea",
      showWhen: { fieldId: "service_type", equals: "Other" },
      required: true,
    },
  ],
  environmental_issue: [
    {
      id: "pollution_type",
      label: "Type of pollution or environmental harm",
      type: "select",
      options: ["Air", "Water", "Noise", "Solid waste", "Chemical", "Other"],
      required: true,
    },
    {
      id: "duration",
      label: "How long has this been happening?",
      type: "text",
      placeholder: "e.g. 3 months, since January 2025",
      required: true,
    },
    {
      id: "health_impact",
      label: "Any health impact observed?",
      type: "textarea",
    },
    {
      id: "source_location",
      label: "Source or location of pollution",
      type: "text",
      required: true,
    },
  ],
  infrastructure_complaint: [
    {
      id: "issue_type",
      label: "Type of infrastructure issue",
      type: "select",
      options: ["Road damage", "Water issue", "Bridge/building", "Drainage", "Other"],
      required: true,
    },
    {
      id: "exact_location",
      label: "Exact location",
      type: "text",
      placeholder: "Road name, landmark, GPS if available",
      required: true,
    },
    {
      id: "date_noticed",
      label: "Date you noticed the damage",
      type: "date",
      required: true,
    },
    {
      id: "road_number",
      label: "Road number or name",
      type: "text",
      showWhen: { fieldId: "issue_type", equals: "Road damage" },
      required: true,
    },
    {
      id: "water_body_type",
      label: "Water body or supply type",
      type: "text",
      showWhen: { fieldId: "issue_type", equals: "Water issue" },
      required: true,
    },
  ],
};

export function getVisibleFields(
  category: RTICategory,
  answers: Record<string, string>
): RTIFormField[] {
  return RTI_FORM_TEMPLATES[category].filter((field) => {
    if (!field.showWhen) return true;
    return answers[field.showWhen.fieldId] === field.showWhen.equals;
  });
}

export function validateCategoryAnswers(
  category: RTICategory,
  answers: Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of getVisibleFields(category, answers)) {
    if (field.required && !answers[field.id]?.trim()) {
      errors[field.id] = `${field.label} is required`;
    }
  }
  return errors;
}

export function formatCategoryAnswersForPrompt(
  category: RTICategory,
  answers: Record<string, string>
): string {
  const lines = getVisibleFields(category, answers)
    .filter((field) => answers[field.id]?.trim())
    .map((field) => `- ${field.label}: ${answers[field.id].trim()}`);

  if (lines.length === 0) return "";
  return `\n\nAdditional RTI context (${RTI_CATEGORY_LABELS[category]}):\n${lines.join("\n")}`;
}
