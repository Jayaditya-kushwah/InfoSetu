"use client";

import { Download, FileText, Loader2, Scale, Shield } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { RTIPreview } from "@/components/rti-preview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  buildRTIPdfFilename,
  downloadRTIAsPDF,
} from "@/lib/pdf-export";
import {
  buildDraftFromAIResponse,
  type GenerateRTIResponse,
  type RTIDraft,
} from "@/lib/rti-types";

const PLACEHOLDER = `Describe your civic issue in plain English or Hindi...

Example: The main road in Sector 12, Pune has had large potholes for 6 months. Multiple complaints to the municipal corporation have gone unanswered. I want to know what action has been taken and how much was spent on repairs.`;

export function Dashboard() {
  const [grievance, setGrievance] = useState("");
  const [draft, setDraft] = useState<RTIDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiWarning, setApiWarning] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    const userInput = grievance.trim();
    if (!userInput) return;

    setIsGenerating(true);
    setError(null);
    setApiWarning(null);

    try {
      const response = await fetch("/api/generate-rti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: userInput }),
      });

      const data = (await response.json()) as
        | (GenerateRTIResponse & {
            _meta?: {
              source?: string;
              warning?: string;
              saved?: boolean;
              saveError?: string;
            };
          })
        | { error: string };

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error : "Failed to generate RTI draft"
        );
      }

      const aiResult = data as GenerateRTIResponse & {
        _meta?: {
          source?: string;
          warning?: string;
          saved?: boolean;
          saveError?: string;
        };
      };
      const previewDraft = buildDraftFromAIResponse(aiResult);
      setDraft(previewDraft);

      if (aiResult._meta?.warning) {
        setApiWarning(aiResult._meta.warning);
      }

      if (aiResult._meta?.saved === false && aiResult._meta?.saveError) {
        setError(
          `Draft generated, but save to database failed: ${aiResult._meta.saveError}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDraft(null);
    } finally {
      setIsGenerating(false);
    }
  }, [grievance]);

  const handleDownload = useCallback(async () => {
    const previewElement =
      previewRef.current ??
      document.getElementById("rti-preview-sheet");

    if (!previewElement || !draft) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      await downloadRTIAsPDF(previewElement, {
        filename: buildRTIPdfFilename(draft.subject),
      });
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : "Failed to generate PDF"
      );
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
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:flex">
            <Shield className="h-3.5 w-3.5 text-blue-600" />
            RTI Act, 2005 compliant drafting
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            Civic Grievance to RTI Draft
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Describe your issue in everyday language. Our Legal Draftsman Agent
            converts it into a formal, rejection-proof RTI application ready for
            submission.
          </p>
        </div>

        <div className="grid min-h-[calc(100vh-220px)] grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="flex flex-col border-slate-200/80 shadow-md">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <FileText className="h-5 w-5 text-blue-700" />
                Your Grievance
              </CardTitle>
              <CardDescription>
                Write freely in English or Hindi (हिंदी). Emotional language
                is filtered; only factual requests are included.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 pt-6">
              <Textarea
                value={grievance}
                onChange={(e) => setGrievance(e.target.value)}
                placeholder={PLACEHOLDER}
                className="min-h-[320px] flex-1 resize-none border-slate-200 bg-white text-base leading-relaxed text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-600/30 lg:min-h-[400px]"
              />
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
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  {grievance.length > 0
                    ? `${grievance.length} characters`
                    : "Minimum 20 characters recommended"}
                </p>
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={grievance.trim().length < 10 || isGenerating}
                  className="bg-blue-700 px-6 shadow-md hover:bg-blue-800"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Drafting…
                    </>
                  ) : (
                    "Generate Legally Binding RTI Draft"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col border-slate-200/80 shadow-md">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-slate-900">
                    Official RTI Preview
                  </CardTitle>
                  <CardDescription>
                    Review your draft before downloading. Routed department is
                    auto-detected.
                  </CardDescription>
                </div>
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
                      Enter your grievance and click Generate to see a
                      professionally formatted preview.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
