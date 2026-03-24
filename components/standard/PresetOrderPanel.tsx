"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/store";
import { Pill, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import type { MedicationPreset } from "@/lib/types";

/**
 * PresetOrderPanel — Standard mode medication ordering.
 * Shows curated preset medications instead of the full OrdersModal.
 * Each medication has a category (correct/neutral/harmful) and explanation.
 */
export function PresetOrderPanel() {
  const activeModal = useGameStore((state) => state.activeModal);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const standardOverlay = useGameStore((state) => state.standardOverlay);
  const addOrderedMedication = useGameStore((state) => state.addOrderedMedication);
  const addMessage = useGameStore((state) => state.addMessage);
  const addPlayerAction = useGameStore((state) => state.addPlayerAction);
  const addStandardScore = useGameStore((state) => state.addStandardScore);
  const addCompletedScoringAction = useGameStore((state) => state.addCompletedScoringAction);
  const completedScoringActions = useGameStore((state) => state.completedScoringActions);
  const orderedMedications = useGameStore((state) => state.orderedMedications);
  const addNurseHint = useGameStore((state) => state.addNurseHint);

  const [selectedMed, setSelectedMed] = useState<MedicationPreset | null>(null);

  const isOpen = activeModal === "orders";

  if (!standardOverlay) return null;

  const presets = standardOverlay.medicationPresets;

  const handleSelectMed = (med: MedicationPreset) => {
    if (orderedMedications.some((m) => m.name === med.name)) return;
    setSelectedMed(med);
  };

  const handleConfirmOrder = () => {
    if (!selectedMed) return;

    // Add to store
    addOrderedMedication({
      name: selectedMed.name,
      dose: selectedMed.display.split(" ").slice(1).join(" ") || "standard dose",
      unit: "",
      frequency: "STAT",
      route: "IV",
      warning: selectedMed.category === "harmful" ? selectedMed.explanation : undefined,
    });

    // Add message showing what was ordered + explanation
    const emoji =
      selectedMed.category === "correct" ? "✅" :
      selectedMed.category === "harmful" ? "⚠️" : "ℹ️";

    addMessage({
      role: "system",
      content: `【醫囑開立】${selectedMed.display}`,
    });

    // Show nurse reaction after a short conceptual delay
    if (selectedMed.explanation) {
      addMessage({
        role: "nurse",
        content: selectedMed.explanation,
      });
    }

    // Track scoring
    if (selectedMed.category === "correct") {
      const scoringMap: Record<string, string> = {
        norepi: "order_vasopressor",
        dobutamine: "order_inotrope",
        furosemide: "order_diuretic",
      };
      const scoringId = scoringMap[selectedMed.id];
      if (scoringId && !completedScoringActions.includes(scoringId)) {
        addCompletedScoringAction(scoringId);
        const scoringAction = standardOverlay.scoring.keyActions.find(
          (a) => a.id === scoringId
        );
        if (scoringAction) {
          addStandardScore(scoringAction.points);
        }
      }
    } else if (selectedMed.category === "harmful") {
      // Deduct points and fire wrong_action hint
      addStandardScore(-10);
      addPlayerAction("medication", `開立不適當醫囑: ${selectedMed.name}`, {
        category: "harmful",
      });

      // Trigger the wrong_action hint for fluid bolus
      if (selectedMed.id === "ns_500") {
        // The GuidanceEngine will pick this up
      }
    }

    addPlayerAction(
      "medication",
      `開立醫囑: ${selectedMed.name}`,
      { presetId: selectedMed.id, category: selectedMed.category }
    );

    setSelectedMed(null);
  };

  const handleClose = () => {
    setSelectedMed(null);
    setActiveModal(null);
  };

  const getCategoryIcon = (category: MedicationPreset["category"], ordered: boolean) => {
    if (!ordered) return null;
    switch (category) {
      case "correct":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "harmful":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "neutral":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            藥物處置
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          <p className="text-sm text-muted-foreground mb-3">
            選擇你要給病人的藥物。護理師會告訴你結果。
          </p>

          {presets.map((med) => {
            const isOrdered = orderedMedications.some((m) => m.name === med.name);
            const isSelected = selectedMed?.id === med.id;

            return (
              <Card
                key={med.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-primary" : ""
                } ${isOrdered ? "opacity-60" : "hover:shadow-md"}`}
                onClick={() => !isOrdered && handleSelectMed(med)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(med.category, isOrdered)}
                    <div>
                      <div className="font-medium text-sm">{med.name}</div>
                      <div className="text-xs text-muted-foreground">{med.display}</div>
                    </div>
                  </div>
                  {isOrdered ? (
                    <Badge variant="secondary" className="text-xs">已開立</Badge>
                  ) : isSelected ? (
                    <Badge className="text-xs">已選擇</Badge>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button
            onClick={handleConfirmOrder}
            disabled={!selectedMed}
          >
            {selectedMed ? `開立 ${selectedMed.name}` : "請選擇藥物"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
