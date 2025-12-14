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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGameStore } from "@/lib/store";
import { TestTube } from "lucide-react";

interface LabItem {
  id: string;
  label: string;
  category: string;
}

const labCategories = [
  {
    id: "cbc",
    name: "CBC",
    items: [
      { id: "wbc", label: "WBC" },
      { id: "hb", label: "Hb" },
      { id: "hct", label: "Hct" },
      { id: "platelet", label: "Platelet" },
    ],
  },
  {
    id: "biochemistry",
    name: "Biochemistry",
    items: [
      { id: "bun", label: "BUN" },
      { id: "cr", label: "Creatinine" },
      { id: "na", label: "Na" },
      { id: "k", label: "K" },
      { id: "ast", label: "AST" },
      { id: "alt", label: "ALT" },
    ],
  },
  {
    id: "cardiac",
    name: "Cardiac Markers",
    items: [
      { id: "troponin_i", label: "Troponin-I" },
      { id: "nt_probnp", label: "NT-proBNP" },
    ],
  },
  {
    id: "infection",
    name: "Infection Markers",
    items: [
      { id: "procalcitonin", label: "Procalcitonin" },
      { id: "lactate", label: "Lactate" },
      { id: "crp", label: "CRP" },
    ],
  },
  {
    id: "abg",
    name: "ABG",
    items: [
      { id: "ph", label: "pH" },
      { id: "pco2", label: "pCO2" },
      { id: "po2", label: "pO2" },
      { id: "hco3", label: "HCO3" },
      { id: "be", label: "BE" },
      { id: "sao2", label: "SaO2" },
    ],
  },
  {
    id: "coagulation",
    name: "Coagulation",
    items: [
      { id: "pt_inr", label: "PT (INR)" },
      { id: "aptt", label: "aPTT" },
      { id: "d_dimer", label: "D-dimer" },
    ],
  },
];

export function LabOrderModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const orderedLabs = useGameStore((state) => state.orderedLabs);
  const addOrderedLab = useGameStore((state) => state.addOrderedLab);
  const setLabResultsAvailable = useGameStore(
    (state) => state.setLabResultsAvailable
  );
  const addMessage = useGameStore((state) => state.addMessage);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const isOpen = activeModal === "lab-order";

  const isCategoryOrdered = (categoryId: string) => {
    return orderedLabs.some((lab) => lab.category === categoryId);
  };

  const toggleCategory = (categoryId: string) => {
    if (isCategoryOrdered(categoryId)) return;

    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleOrder = () => {
    if (selectedCategories.length === 0) return;

    selectedCategories.forEach((categoryId) => {
      const category = labCategories.find((c) => c.id === categoryId);
      if (category) {
        addOrderedLab({
          category: categoryId,
          items: category.items.map((i) => i.id),
        });

        // Simulate lab results coming back after delay
        setTimeout(() => {
          setLabResultsAvailable(categoryId);
        }, 2000);
      }
    });

    const categoryNames = selectedCategories
      .map((id) => labCategories.find((c) => c.id === id)?.name)
      .join(", ");

    addMessage({
      role: "system",
      content: `【檢驗開立】已開立：${categoryNames}\n報告約 2 秒後可查看。`,
    });

    setSelectedCategories([]);
    setActiveModal(null);
  };

  const handleClose = () => {
    setSelectedCategories([]);
    setActiveModal(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            開立檢驗 (Order Labs)
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {labCategories.map((category) => {
              const isOrdered = isCategoryOrdered(category.id);
              const isSelected = selectedCategories.includes(category.id);

              return (
                <div
                  key={category.id}
                  className={`p-3 rounded-lg border ${
                    isOrdered
                      ? "bg-muted opacity-60"
                      : isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50 cursor-pointer"
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected || isOrdered}
                      disabled={isOrdered}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {category.name}
                        {isOrdered && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (已開立)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {category.items.map((i) => i.label).join(", ")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button
            onClick={handleOrder}
            disabled={selectedCategories.length === 0}
          >
            開立 ({selectedCategories.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
