"use client";

import { forwardRef, type CSSProperties } from "react";

import type { RTIDraft } from "@/lib/rti-types";

interface RTIPreviewProps {
  draft: RTIDraft;
}

const sheetStyle: CSSProperties = {
  fontFamily: "'Times New Roman', Times, serif",
  width: "100%",
  maxWidth: "720px",
  margin: "0 auto",
  background: "#ffffff",
  color: "#1e293b",
  padding: "40px 44px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  boxSizing: "border-box",
  wordWrap: "break-word",
  overflowWrap: "break-word",
};

export const RTIPreview = forwardRef<HTMLDivElement, RTIPreviewProps>(
  function RTIPreview({ draft }, ref) {
    return (
      <div ref={ref} id="rti-preview-sheet" data-rti-preview style={sheetStyle}>
        {/* Letterhead */}
        <div
          data-rti-header
          style={{
            textAlign: "center",
            borderBottom: "2px solid #1e293b",
            paddingBottom: "14px",
            marginBottom: "22px",
          }}
        >
          <p
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#64748b",
              margin: 0,
            }}
          >
            Application under the Right to Information Act, 2005
          </p>
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#0f172a",
              margin: "8px 0 4px",
            }}
          >
            Form of Application for Obtaining Information
          </h2>
          <p
            style={{
              fontSize: "9px",
              fontStyle: "italic",
              color: "#64748b",
              margin: 0,
            }}
          >
            (As per Section 6(1) of the RTI Act, 2005)
          </p>
        </div>

        {/* Date */}
        <p
          style={{
            textAlign: "right",
            fontSize: "13px",
            margin: "0 0 18px",
          }}
        >
          <strong>Date:</strong> {draft.date}
        </p>

        {/* To / From */}
        <div style={{ fontSize: "13px", lineHeight: 1.55, marginBottom: "16px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#64748b",
              margin: "0 0 4px",
            }}
          >
            To,
          </p>
          <div
            style={{
              paddingLeft: "16px",
              whiteSpace: "pre-line",
              marginBottom: "14px",
            }}
          >
            {draft.to}
          </div>

          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#64748b",
              margin: "0 0 4px",
            }}
          >
            From,
          </p>
          <div style={{ paddingLeft: "16px", whiteSpace: "pre-line" }}>
            {draft.from}
          </div>
        </div>

        {/* Subject */}
        <div
          data-subject-box
          style={{
            borderLeft: "4px solid #1e40af",
            background: "#f8fafc",
            padding: "10px 14px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#64748b",
              margin: "0 0 4px",
            }}
          >
            Subject
          </p>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {draft.subject}
          </p>
        </div>

        {/* Body */}
        <div style={{ fontSize: "13px", lineHeight: 1.65, color: "#1e293b" }}>
          {draft.body.map((paragraph, index) =>
            paragraph === "" ? (
              <div key={index} style={{ height: "10px" }} />
            ) : /^\d+\./.test(paragraph) ? (
              <p
                key={index}
                style={{ margin: "0 0 8px", paddingLeft: "16px", textAlign: "justify" }}
              >
                {paragraph}
              </p>
            ) : (
              <p key={index} style={{ margin: "0 0 8px", textAlign: "justify" }}>
                {paragraph}
              </p>
            )
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "28px",
            paddingTop: "14px",
            borderTop: "1px solid #cbd5e1",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontStyle: "italic",
              color: "#64748b",
              margin: "0 0 20px",
              lineHeight: 1.5,
            }}
          >
            {draft.feeNote}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ fontSize: "9px", color: "#94a3b8", lineHeight: 1.5 }}>
              <p style={{ margin: 0 }}>Generated via RTI-Ease CivicTech Platform</p>
              <p style={{ margin: 0 }}>www.rti-ease.in</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "128px",
                  height: "48px",
                  borderBottom: "1px solid #94a3b8",
                  marginBottom: "4px",
                }}
              />
              <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>Signature</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
