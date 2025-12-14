"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
import { FileCheck, AlertCircle } from "lucide-react";

const diagnosisOptions = [
  { id: "cardiogenic_shock", label: "Cardiogenic Shock" },
  { id: "septic_shock", label: "Septic Shock" },
  { id: "hypovolemic_shock", label: "Hypovolemic Shock" },
  { id: "distributive_shock", label: "Distributive Shock (other)" },
  { id: "obstructive_shock", label: "Obstructive Shock" },
  { id: "mixed_shock", label: "Mixed Shock" },
];

export function DiagnosisModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const endGame = useGameStore((state) => state.endGame);

  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(
    null
  );
  const [showConfirm, setShowConfirm] = useState(false);

  const isOpen = activeModal === "diagnosis";

  const handleSelect = (diagnosisId: string) => {
    setSelectedDiagnosis(diagnosisId);
  };

  const handleSubmit = () => {
    if (!selectedDiagnosis) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!selectedDiagnosis) return;
    endGame(selectedDiagnosis);
    setShowConfirm(false);
    setSelectedDiagnosis(null);
    setActiveModal("debrief");
  };

  const handleClose = () => {
    setSelectedDiagnosis(null);
    setShowConfirm(false);
    setActiveModal(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            提交診斷
          </DialogTitle>
          <DialogDescription>
            根據您的評估，這位病人最可能的診斷是什麼？
          </DialogDescription>
        </DialogHeader>

        {!showConfirm ? (
          <>
            <div className="space-y-2 py-4">
              {diagnosisOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedDiagnosis === option.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSelect(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={!selectedDiagnosis}>
                提交診斷
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-6">
              <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">確認提交？</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    您選擇的診斷是：
                    <span className="font-medium text-foreground">
                      {" "}
                      {
                        diagnosisOptions.find(
                          (o) => o.id === selectedDiagnosis
                        )?.label
                      }
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    提交後將進入 Debrief 環節，無法返回修改。
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                返回修改
              </Button>
              <Button onClick={handleConfirm}>確認提交</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
