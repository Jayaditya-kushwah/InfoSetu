"use client";

import { Moon, Sun, Computer } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme/theme-provider";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  showLabel?: boolean;
}

export function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const [isMounted, setIsMounted] = useState(false);
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Only render after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !theme) {
    return <div className="w-10 h-10" />;
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Computer },
  ] as const;

  const currentTheme = themes.find((t) => t.value === theme.theme);

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 px-0"
        title={`Current theme: ${theme.theme}`}
      >
        {currentTheme ? (
          <currentTheme.icon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
        {showLabel && <span className="ml-2 text-xs">{theme.theme}</span>}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 z-50">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                theme.setTheme(t.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                theme.theme === t.value
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span>{t.label}</span>
              {theme.theme === t.value && (
                <span className="ml-auto text-xs font-semibold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
