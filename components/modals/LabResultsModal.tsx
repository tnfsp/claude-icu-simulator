"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGameStore } from "@/lib/store";
import { ClipboardList, AlertTriangle } from "lucide-react";

// Normal ranges for highlighting abnormal values
const normalRanges: Record<string, { min: number; max: number; unit: string }> = {
  // CBC
  wbc: { min: 4.5, max: 11.0, unit: "x10³/μL" },
  hb: { min: 12.0, max: 16.0, unit: "g/dL" },
  hct: { min: 36, max: 48, unit: "%" },
  platelet: { min: 150, max: 400, unit: "x10³/μL" },
  // Biochemistry
  bun: { min: 7, max: 20, unit: "mg/dL" },
  cr: { min: 0.6, max: 1.2, unit: "mg/dL" },
  na: { min: 136, max: 145, unit: "mEq/L" },
  k: { min: 3.5, max: 5.0, unit: "mEq/L" },
  ast: { min: 0, max: 40, unit: "U/L" },
  alt: { min: 0, max: 40, unit: "U/L" },
  // Cardiac
  troponin_i: { min: 0, max: 0.04, unit: "ng/mL" },
  nt_probnp: { min: 0, max: 125, unit: "pg/mL" },
  // Infection
  procalcitonin: { min: 0, max: 0.5, unit: "ng/mL" },
  lactate: { min: 0.5, max: 2.0, unit: "mmol/L" },
  crp: { min: 0, max: 1.0, unit: "mg/dL" },
  // ABG
  ph: { min: 7.35, max: 7.45, unit: "" },
  pco2: { min: 35, max: 45, unit: "mmHg" },
  po2: { min: 80, max: 100, unit: "mmHg" },
  hco3: { min: 22, max: 26, unit: "mEq/L" },
  be: { min: -2, max: 2, unit: "mEq/L" },
  sao2: { min: 95, max: 100, unit: "%" },
  // Coagulation
  pt_inr: { min: 0.9, max: 1.1, unit: "" },
  aptt: { min: 25, max: 35, unit: "sec" },
  d_dimer: { min: 0, max: 0.5, unit: "mg/L" },
};

const labDisplayNames: Record<string, string> = {
  wbc: "WBC",
  hb: "Hb",
  hct: "Hct",
  platelet: "Platelet",
  bun: "BUN",
  cr: "Creatinine",
  na: "Na",
  k: "K",
  ast: "AST",
  alt: "ALT",
  troponin_i: "Troponin-I",
  nt_probnp: "NT-proBNP",
  procalcitonin: "Procalcitonin",
  lactate: "Lactate",
  crp: "CRP",
  ph: "pH",
  pco2: "pCO2",
  po2: "pO2",
  hco3: "HCO3",
  be: "BE",
  sao2: "SaO2",
  pt_inr: "PT (INR)",
  aptt: "aPTT",
  d_dimer: "D-dimer",
};

const categoryNames: Record<string, string> = {
  cbc: "CBC (全血球計數)",
  biochemistry: "Biochemistry (生化)",
  cardiac: "Cardiac Markers (心臟標記)",
  infection: "Infection Markers (感染指標)",
  abg: "ABG (動脈血氣分析)",
  coagulation: "Coagulation (凝血功能)",
};

function isAbnormal(key: string, value: number): boolean {
  const range = normalRanges[key];
  if (!range) return false;
  return value < range.min || value > range.max;
}

function getAbnormalDirection(key: string, value: number): "high" | "low" | null {
  const range = normalRanges[key];
  if (!range) return null;
  if (value > range.max) return "high";
  if (value < range.min) return "low";
  return null;
}

export function LabResultsModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const scenario = useGameStore((state) => state.scenario);
  const orderedLabs = useGameStore((state) => state.orderedLabs);

  const isOpen = activeModal === "lab-results";

  const availableLabs = orderedLabs.filter((lab) => lab.resultsAvailable);

  if (!scenario) return null;

  const labResults = scenario.lab_results;

  const getLabValue = (category: string, item: string): number | undefined => {
    const categoryData = labResults[category as keyof typeof labResults];
    if (!categoryData) return undefined;
    return (categoryData as unknown as Record<string, number>)[item];
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setActiveModal(null)}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            檢驗報告 (Lab Results)
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {availableLabs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              尚無檢驗報告，請先開立檢驗。
            </div>
          ) : (
            <div className="space-y-4">
              {availableLabs.map((lab) => (
                <Card key={lab.category}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">
                      {categoryNames[lab.category] || lab.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">項目</th>
                          <th className="text-right py-2 font-medium">數值</th>
                          <th className="text-right py-2 font-medium text-muted-foreground">
                            參考值
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {lab.items.map((item) => {
                          const value = getLabValue(lab.category, item);
                          const range = normalRanges[item];
                          const abnormal = value !== undefined && isAbnormal(item, value);
                          const direction = value !== undefined ? getAbnormalDirection(item, value) : null;

                          return (
                            <tr
                              key={item}
                              className={`border-b last:border-0 ${
                                abnormal ? "bg-red-50 dark:bg-red-950/30" : ""
                              }`}
                            >
                              <td className="py-2">
                                {labDisplayNames[item] || item}
                              </td>
                              <td className="text-right py-2">
                                <span
                                  className={`font-medium ${
                                    abnormal
                                      ? "text-red-600 dark:text-red-400"
                                      : ""
                                  }`}
                                >
                                  {value !== undefined ? value : "-"}
                                  {abnormal && (
                                    <span className="ml-1 text-xs">
                                      {direction === "high" ? "↑" : "↓"}
                                    </span>
                                  )}
                                </span>
                                {range && (
                                  <span className="text-muted-foreground ml-1">
                                    {range.unit}
                                  </span>
                                )}
                              </td>
                              <td className="text-right py-2 text-muted-foreground">
                                {range ? `${range.min}-${range.max}` : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              ))}

              {/* Summary of abnormal values */}
              {availableLabs.length > 0 && (
                <Card className="border-orange-200 dark:border-orange-800">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <AlertTriangle className="h-4 w-4" />
                      異常值摘要
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm space-y-1">
                      {availableLabs.flatMap((lab) =>
                        lab.items
                          .filter((item) => {
                            const value = getLabValue(lab.category, item);
                            return value !== undefined && isAbnormal(item, value);
                          })
                          .map((item) => {
                            const value = getLabValue(lab.category, item);
                            const direction = value !== undefined ? getAbnormalDirection(item, value) : null;
                            return (
                              <div key={`${lab.category}-${item}`}>
                                <span className="font-medium">
                                  {labDisplayNames[item]}
                                </span>
                                : {value}{" "}
                                <span className="text-red-600 dark:text-red-400">
                                  ({direction === "high" ? "偏高" : "偏低"})
                                </span>
                              </div>
                            );
                          })
                      )}
                      {availableLabs.every((lab) =>
                        lab.items.every((item) => {
                          const value = getLabValue(lab.category, item);
                          return value === undefined || !isAbnormal(item, value);
                        })
                      ) && (
                        <div className="text-muted-foreground">
                          目前報告無明顯異常
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
