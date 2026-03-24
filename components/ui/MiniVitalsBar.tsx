"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { VitalSignsPanel } from "@/components/VitalSignsPanel";
import { ColorVitalsPanel } from "@/components/standard/ColorVitalsPanel";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MiniVitalsBarProps {
  useColorVitals?: boolean;
}

export function MiniVitalsBar({ useColorVitals = false }: MiniVitalsBarProps) {
  const vitals = useGameStore((state) => state.vitals);
  const [expanded, setExpanded] = useState(false);

  if (!vitals) {
    return (
      <div className="bg-card border-b px-3 py-2 text-sm text-muted-foreground">
        Vitals 載入中...
      </div>
    );
  }

  const items = [
    {
      label: "HR",
      value: String(vitals.hr),
      isAbnormal: vitals.hr > 100 || vitals.hr < 60,
    },
    {
      label: "BP",
      value: `${vitals.bp_systolic}/${vitals.bp_diastolic}`,
      isAbnormal: vitals.bp_systolic < 90 || vitals.bp_systolic > 140,
    },
    {
      label: "SpO2",
      value: `${vitals.spo2}%`,
      isAbnormal: vitals.spo2 < 94,
    },
    {
      label: "RR",
      value: String(vitals.rr),
      isAbnormal: vitals.rr > 20 || vitals.rr < 12,
    },
    {
      label: "T",
      value: `${vitals.temperature.toFixed(1)}°`,
      isAbnormal: vitals.temperature > 38 || vitals.temperature < 36,
    },
  ];

  return (
    <div className="bg-card border-b">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-1.5 gap-2"
      >
        <div className="flex items-center gap-3 overflow-x-auto flex-1 min-w-0">
          {items.map((item) => (
            <span
              key={item.label}
              className={`flex items-center gap-1 text-xs font-mono whitespace-nowrap px-1.5 py-0.5 rounded ${
                item.isAbnormal
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                  : "text-foreground"
              }`}
            >
              <span className="text-muted-foreground font-medium">{item.label}</span>
              <span className="font-bold">{item.value}</span>
            </span>
          ))}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3">
          {useColorVitals ? <ColorVitalsPanel /> : <VitalSignsPanel />}
        </div>
      )}
    </div>
  );
}
