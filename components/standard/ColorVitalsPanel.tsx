"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/lib/store";
import { Heart, Wind, Thermometer, Activity, Droplets } from "lucide-react";
import type { VitalSigns, VitalColorRanges } from "@/lib/types";

function getVitalColor(
  value: number,
  ranges: { green: [number, number]; yellow: [number, number]; red: [number, number] }
): "green" | "yellow" | "red" {
  if (value >= ranges.green[0] && value <= ranges.green[1]) return "green";
  if (value >= ranges.yellow[0] && value <= ranges.yellow[1]) return "yellow";
  return "red";
}

const colorClasses = {
  green: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    dot: "bg-green-500",
    badge: "✓ 正常",
    badgeStyle: "text-green-700 dark:text-green-400 text-xs font-medium",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
    dot: "bg-yellow-500",
    badge: "⚠ 注意",
    badgeStyle: "text-yellow-700 dark:text-yellow-400 text-xs font-medium",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500 animate-pulse",
    badge: "⚠️ 危險",
    badgeStyle: "text-red-700 dark:text-red-400 text-xs font-bold",
  },
};

export function ColorVitalsPanel() {
  const vitals = useGameStore((state) => state.vitals);
  const standardOverlay = useGameStore((state) => state.standardOverlay);

  if (!vitals) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Vital Signs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">載入中...</p>
        </CardContent>
      </Card>
    );
  }

  const ranges = standardOverlay?.vitalRanges;

  const vitalItems = [
    {
      label: "HR",
      value: vitals.hr,
      unit: "bpm",
      icon: Heart,
      color: ranges ? getVitalColor(vitals.hr, ranges.hr) : ("green" as const),
      iconColor: "text-red-500",
    },
    {
      label: "BP",
      displayValue: `${vitals.bp_systolic}/${vitals.bp_diastolic}`,
      value: vitals.bp_systolic,
      unit: "mmHg",
      icon: Activity,
      color: ranges ? getVitalColor(vitals.bp_systolic, ranges.bp_systolic) : ("green" as const),
      iconColor: "text-blue-500",
    },
    {
      label: "RR",
      value: vitals.rr,
      unit: "/min",
      icon: Wind,
      color: ranges ? getVitalColor(vitals.rr, ranges.rr) : ("green" as const),
      iconColor: "text-cyan-500",
    },
    {
      label: "SpO2",
      value: vitals.spo2,
      unit: "%",
      icon: Droplets,
      color: ranges ? getVitalColor(vitals.spo2, ranges.spo2) : ("green" as const),
      iconColor: "text-purple-500",
    },
    {
      label: "Temp",
      value: vitals.temperature,
      displayValue: vitals.temperature.toFixed(1),
      unit: "°C",
      icon: Thermometer,
      color: ranges ? getVitalColor(vitals.temperature, ranges.temperature) : ("green" as const),
      iconColor: "text-orange-500",
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Vital Signs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {vitalItems.map((item) => {
          const classes = colorClasses[item.color];
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between p-2 rounded-lg border ${classes.bg} ${classes.border}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${classes.dot}`} />
                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={classes.badgeStyle}>
                  {classes.badge}
                </span>
                <div className="text-right">
                  <span className={`text-lg font-bold ${classes.text}`}>
                    {item.displayValue ?? item.value}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {item.unit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex items-center gap-3 pt-1 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500" /> 正常
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-yellow-500" /> 注意
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-red-500" /> 危險
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
