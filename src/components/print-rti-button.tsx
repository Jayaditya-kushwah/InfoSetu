"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintRTIButtonProps {
  disabled?: boolean;
}

export function PrintRTIButton({ disabled = false }: PrintRTIButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      onClick={handlePrint}
      disabled={disabled}
      variant="outline"
      className="gap-2"
      title="Print RTI or export as PDF (Ctrl+P also works)"
    >
      <Printer className="w-4 h-4" />
      Print RTI
    </Button>
  );
}
