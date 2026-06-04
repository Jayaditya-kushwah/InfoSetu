"use client";

import { Download, FileText, Loader2, Scale, Shield, UserCircle2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PrintRTIButton } from "@/components/print-rti-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { RTIConfirmScreen } from "@/components/rti-confirm-screen";
import { RTIHistoryPanel } from "@/components/rti-history-panel";
import { RTIPreview } from "@/components/rti-preview";
import { AdaptiveQuestionnaire } from "@/components/user-detail/adaptive-questionnaire";
import { ProfileCardsRow } from "@/components/user-detail/profile-cards-row";
import { UserDetailFormModal } from "@/components/user-detail/user-detail-form-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUserProfiles } from "@/hooks/use-user-profiles";
import { buildRTIPdfFilename, downloadRTIAsPDF } from "@/lib/pdf-export";
import {
  RTI_CATEGORY_LABELS,
  detectRTICategory,
  type RTICategory,
} from "@/lib/rti-categories";
import { injectUserDataIntoDraft } from "@/lib/rti-template";
import {
  buildDraftFromAIResponse,
  type GenerateRTIResponse,
  type RTIDraft,
} from "@/lib/rti-types";
import type { UserDetail } from "@/lib/user-types";
import { getStoredUserId } from "@/lib/user-session";

const PLACEHOLDER = `Describe your civic issue in plain English or Hindi...

Example: The main road in Sector 12, Pune has had large potholes for 6 months. Multiple complaints to the municipal corporation have gone unanswered. I want to know what action has been taken and how much was spent on repairs.`;

type FilingStep = "input" | "questionnaire" | "confirm";

export function Dashboard() {
  const [grievance, setGrievance] = useState("");
  const [draft, setDraft] = useState<RTIDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiWarning, setApiWarning] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [filingStep, setFilingStep] = useState<FilingStep>("input");
  const [detectedCategory, setDetectedCategory] = useState<RTICategory | null>(null);
  const [categoryAnswers, setCategoryAnswers] = useState<Record<string, string>>({});
  const [prefilledAnswers, setPrefilledAnswers] = useState<Record<string, string>>({});
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [editingProfile, setEditingProfile] = useState<UserDetail | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const {
    profiles,
    selectedProfile,
    isLoading: profilesLoading,
    refreshProfiles,
    selectProfile,
    deleteProfile,
  } = useUserProfiles();

  useEffect(() => {
    if (profilesLoading || onboardingChecked) return;
    if (profiles.length === 0) {
      setDetailsModalOpen(true);
    }
    setOnboardingChecked(true);
  }, [profilesLoading, profiles.length, onboardingChecked]);

  const openCreateModal = useCallback(() => {
    setEditingProfile(null);
    setDetailsModalOpen(true);
  }, []);

  const openEditModal = useCallback((profile: UserDetail) => {
    setEditingProfile(profile);
    setDetailsModalOpen(true);
  }, []);

  const handleSelectProfile = useCallback(
    async (profile: UserDetail) => {
      try {
        await selectProfile(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to select profile");
      }
    },
    [selectProfile]
  );

  const handleDeleteProfile = useCallback(
    async (profile: UserDetail) => {
      try {
        await deleteProfile(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete profile");
      }
    },
    [deleteProfile]
  );

  const loadCategoryAnswers = useCallback(async (category: RTICategory) => {
    const userId = getStoredUserId();
    if (!userId) {
      setPrefilledAnswers({});
      return;
    }

    try {
      const response = await fetch(
        `/api/user/rti-specific?user_id=${encodeURIComponent(userId)}&category=${category}`
      );
      const data = (await response.json()) as { answers?: Record<string, string> };
      setPrefilledAnswers(data.answers ?? {});
    } catch {
      setPrefilledAnswers({});
    }
  }, []);

  const resetFilingFlow = useCallback(() => {
    setFilingStep("input");
    setDetectedCategory(null);
    setCategoryAnswers({});
    setPrefilledAnswers({});
  }, []);

  const handleStartFiling = useCallback(async () => {
    const userInput = grievance.trim();
    if (!userInput) return;

    if (!selectedProfile) {
      setDetailsModalOpen(true);
      return;
    }

    setError(null);
    setApiWarning(null);
    setDraft(null);

    const category = detectRTICategory(userInput);
    setDetectedCategory(category);
    await loadCategoryAnswers(category);
    setFilingStep("questionnaire");
  }, [grievance, selectedProfile, loadCategoryAnswers]);

  const handleQuestionnaireSubmit = useCallback((answers: Record<string, string>) => {
    setCategoryAnswers(answers);
    setFilingStep("confirm");
  }, []);

  const handleConfirmGenerate = useCallback(async () => {
    const userInput = grievance.trim();
    if (!userInput || !selectedProfile || !detectedCategory) return;

    setIsGenerating(true);
    setError(null);
    setApiWarning(null);

    try {
      const response = await fetch("/api/generate-rti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_input: userInput,
          user_id: getStoredUserId(),
          user_detail_id: selectedProfile.id,
          rti_category: detectedCategory,
          rti_specific_answers: categoryAnswers,
          confirmed: true,
        }),
      });

      const data = (await response.json()) as
        | (GenerateRTIResponse & {
            draft?: RTIDraft;
            _meta?: {
              source?: string;
              warning?: string;
              saved?: boolean;
              saveError?: string;
              rti_record_id?: string;
              rtiRecordError?: string;
            };
          })
        | { error: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Failed to generate RTI draft");
      }

      const aiResult = data as GenerateRTIResponse & {
        draft?: RTIDraft;
        _meta?: {
          source?: string;
          warning?: string;
          saved?: boolean;
          saveError?: string;
          rti_record_id?: string;
          rtiRecordError?: string;
        };
      };

      let previewDraft =
        aiResult.draft ?? buildDraftFromAIResponse(aiResult, selectedProfile);
      previewDraft = injectUserDataIntoDraft(previewDraft, selectedProfile);

      setDraft(previewDraft);
      resetFilingFlow();
      setHistoryRefreshKey((key) => key + 1);

      if (aiResult._meta?.warning) {
        setApiWarning(aiResult._meta.warning);
      }

      if (aiResult._meta?.saved === false && aiResult._meta?.saveError) {
        setError(
          `Draft generated, but save to database failed: ${aiResult._meta.saveError}`
        );
      }

      if (aiResult._meta?.rtiRecordError) {
        setError(
          `Draft generated, but RTI history save failed: ${aiResult._meta.rtiRecordError}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDraft(null);
    } finally {
      setIsGenerating(false);
    }
  }, [grievance, selectedProfile, detectedCategory, categoryAnswers, resetFilingFlow]);

  const handleDownload = useCallback(async () => {
    const previewElement =
      previewRef.current ?? document.getElementById("rti-preview-sheet");

    if (!previewElement || !draft) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      await downloadRTIAsPDF(previewElement, {
        filename: buildRTIPdfFilename(draft.subject),
      });
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  }, [draft]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white shadow-md">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                RTI-Ease
              </h1>
              <p className="text-xs text-slate-500">
                Right to Information, made accessible
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={openCreateModal}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <UserCircle2 />
              {profiles.length > 0 ? "Add Profile" : "Add Details"}
            </Button>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:flex">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              RTI Act, 2005 compliant drafting
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            Civic Grievance to RTI Draft
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Describe your issue in everyday language. Our Legal Draftsman Agent converts
            it into a formal, rejection-proof RTI application ready for submission.
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <ProfileCardsRow
            profiles={profiles}
            activeProfileId={selectedProfile?.id ?? null}
            onSelect={(profile) => void handleSelectProfile(profile)}
            onEdit={openEditModal}
            onDelete={(profile) => void handleDeleteProfile(profile)}
            onAddNew={openCreateModal}
          />
          <RTIHistoryPanel profiles={profiles} refreshKey={historyRefreshKey} />
        </div>

        <div className="grid min-h-[calc(100vh-320px)] grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="flex flex-col border-slate-200/80 shadow-md">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <FileText className="h-5 w-5 text-blue-700" />
                Your Grievance
              </CardTitle>
              <CardDescription>
                Write freely in English or Hindi (हिंदी). Emotional language is
                filtered; only factual requests are included.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 pt-6">
              {selectedProfile && filingStep === "input" && (
                <div className="rounded-md border border-blue-100 bg-blue-50/70 px-3 py-2 text-sm text-blue-900">
                  Using profile:{" "}
                  <span className="font-medium">{selectedProfile.full_name}</span>
                  <span className="mx-2 text-blue-400">·</span>
                  {selectedProfile.district}, {selectedProfile.state}
                </div>
              )}

              {filingStep === "input" && (
                <Textarea
                  value={grievance}
                  onChange={(e) => setGrievance(e.target.value)}
                  placeholder={PLACEHOLDER}
                  className="min-h-[280px] flex-1 resize-none border-slate-200 bg-white text-base leading-relaxed text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-600/30 lg:min-h-[360px]"
                />
              )}

              {filingStep === "questionnaire" && detectedCategory && (
                <AdaptiveQuestionnaire
                  category={detectedCategory}
                  initialAnswers={prefilledAnswers}
                  onSubmit={handleQuestionnaireSubmit}
                  onSkip={() => {
                    setCategoryAnswers({});
                    setFilingStep("confirm");
                  }}
                />
              )}

              {filingStep === "confirm" && selectedProfile && (
                <div className="space-y-3">
                  {detectedCategory && (
                    <p className="text-xs text-slate-500">
                      RTI type: {RTI_CATEGORY_LABELS[detectedCategory]}
                    </p>
                  )}
                  <RTIConfirmScreen
                    profile={selectedProfile}
                    onEdit={() => openEditModal(selectedProfile)}
                    onConfirm={() => void handleConfirmGenerate()}
                    isConfirming={isGenerating}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetFilingFlow}
                  >
                    Back to grievance
                  </Button>
                </div>
              )}

              {apiWarning && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {apiWarning}
                </p>
              )}
              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              {filingStep === "input" && (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-slate-500">
                    {grievance.length > 0
                      ? `${grievance.length} characters`
                      : "Minimum 20 characters recommended"}
                  </p>
                  <Button
                    size="lg"
                    onClick={() => void handleStartFiling()}
                    disabled={grievance.trim().length < 10 || isGenerating}
                    className="bg-blue-700 px-6 shadow-md hover:bg-blue-800"
                  >
                    Generate Legally Binding RTI Draft
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex flex-col border-slate-200/80 shadow-md">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-slate-900">Official RTI Preview</CardTitle>
                  <CardDescription>
                    Review your draft before downloading. Routed department is
                    auto-detected.
                  </CardDescription>
                </div>
                <div className="flex shrink-0 gap-2">
                  <PrintRTIButton disabled={!draft} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!draft || isDownloading}
                    className="shrink-0 border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    {isDownloading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Download />
                    )}
                    Download RTI as PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col overflow-hidden p-4 pt-4">
              {downloadError && (
                <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {downloadError}
                </p>
              )}
              <div
                id="rti-preview-container"
                className="flex flex-1 justify-center overflow-y-auto rounded-lg bg-slate-100/80 p-4"
              >
                {draft ? (
                  <RTIPreview ref={previewRef} draft={draft} />
                ) : (
                  <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white p-8 text-center">
                    <FileText className="mb-4 h-12 w-12 text-slate-300" />
                    <p className="font-medium text-slate-500">
                      Your RTI draft will appear here
                    </p>
                    <p className="mt-1 max-w-xs text-sm text-slate-400">
                      Enter your grievance, answer RTI-specific questions, confirm your
                      details, then download the final draft.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <UserDetailFormModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setEditingProfile(null);
        }}
        onSuccess={() => {
          void refreshProfiles();
          setEditingProfile(null);
        }}
        dismissible={profiles.length > 0 || Boolean(editingProfile)}
        editDetailId={editingProfile?.id}
        title={
          editingProfile
            ? "Edit Profile"
            : profiles.length > 0
              ? "Add New Profile"
              : "Welcome — Save Your Details"
        }
        description={
          editingProfile
            ? "Update this profile's information."
            : profiles.length > 0
              ? "Create another profile for a different address or family member."
              : "Before you file your first RTI, save your name and address once."
        }
        submitLabel={
          editingProfile
            ? "Save Changes"
            : profiles.length > 0
              ? "Save Profile"
              : "Save & Continue"
        }
        initialValues={
          editingProfile
            ? {
                full_name: editingProfile.full_name,
                email: editingProfile.email,
                phone: editingProfile.phone,
                street_address: editingProfile.street_address,
                state: editingProfile.state,
                district: editingProfile.district,
                postal_code: editingProfile.postal_code,
              }
            : undefined
        }
      />
    </div>
  );
}
