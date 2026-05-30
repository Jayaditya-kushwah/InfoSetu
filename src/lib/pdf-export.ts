"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/** Content width for US Letter with 0.5" side margins at 96 DPI */
const CONTENT_WIDTH_PX = 720;
const PAGE_MARGIN_MM = 12.7;

const PDF_SAFE_STYLES = `
  *, *::before, *::after {
    box-sizing: border-box !important;
    box-shadow: none !important;
  }
  html, body {
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
    width: auto !important;
    height: auto !important;
    overflow: visible !important;
  }
  #rti-preview-container,
  [data-rti-preview],
  #rti-preview-sheet {
    overflow: visible !important;
    max-height: none !important;
  }
  #rti-preview-container {
    background: #ffffff !important;
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    justify-content: center !important;
  }
  #rti-preview-sheet {
    width: ${CONTENT_WIDTH_PX}px !important;
    max-width: ${CONTENT_WIDTH_PX}px !important;
    margin: 0 auto !important;
    padding: 40px 44px !important;
    min-height: auto !important;
    background: #ffffff !important;
    box-shadow: none !important;
    font-family: 'Times New Roman', Times, serif !important;
    color: #1e293b !important;
    overflow: visible !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
  #rti-preview-sheet * {
    overflow: visible !important;
    max-width: 100% !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
`;

function prepareCloneForPdf(clonedDoc: Document) {
  clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    node.remove();
  });

  const safeStyle = clonedDoc.createElement("style");
  safeStyle.textContent = PDF_SAFE_STYLES;
  clonedDoc.head.appendChild(safeStyle);

  clonedDoc.body.style.background = "#ffffff";
  clonedDoc.body.style.margin = "0";
  clonedDoc.body.style.padding = "0";
  clonedDoc.body.style.overflow = "visible";

  for (const id of ["rti-preview-container"]) {
    const el = clonedDoc.getElementById(id);
    if (el instanceof HTMLElement) {
      el.style.overflow = "visible";
      el.style.maxHeight = "none";
    }
  }
}

function getCaptureDimensions(element: HTMLElement) {
  const width = Math.max(element.scrollWidth, element.offsetWidth, CONTENT_WIDTH_PX);
  const height = Math.max(element.scrollHeight, element.offsetHeight);
  return { width, height };
}

export interface DownloadPDFOptions {
  filename?: string;
}

export async function downloadRTIAsPDF(
  element: HTMLElement,
  options: DownloadPDFOptions = {}
): Promise<void> {
  const { filename = "RTI-Application.pdf" } = options;

  element.scrollIntoView({ block: "start" });
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

  const { width, height } = getCaptureDimensions(element);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    scrollX: 0,
    scrollY: -window.scrollY,
    width,
    height,
    windowWidth: width + 40,
    windowHeight: height + 40,
    onclone: (clonedDoc) => {
      prepareCloneForPdf(clonedDoc);
    },
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  const contentWidthMm = pageWidthMm - PAGE_MARGIN_MM * 2;
  const contentHeightMm = pageHeightMm - PAGE_MARGIN_MM * 2;

  const imgData = canvas.toDataURL("image/png");
  const imgHeightMm = (canvas.height * contentWidthMm) / canvas.width;

  const xMm = PAGE_MARGIN_MM;
  let yOffsetMm = 0;
  let page = 0;

  while (yOffsetMm < imgHeightMm - 0.5) {
    if (page > 0) {
      pdf.addPage("letter", "portrait");
    }

    pdf.addImage(
      imgData,
      "PNG",
      xMm,
      PAGE_MARGIN_MM - yOffsetMm,
      contentWidthMm,
      imgHeightMm
    );

    yOffsetMm += contentHeightMm;
    page += 1;
  }

  pdf.save(filename);
}

export function buildRTIPdfFilename(subject?: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const slug = subject
    ? subject
        .slice(0, 40)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    : "application";

  return `RTI-${slug}-${date}.pdf`;
}
