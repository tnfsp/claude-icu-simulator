"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGameStore } from "@/lib/store";
import { ImageIcon, Check } from "lucide-react";
import { useState } from "react";

export function CXRModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const scenario = useGameStore((state) => state.scenario);
  const addMessage = useGameStore((state) => state.addMessage);
  const addPlayerAction = useGameStore((state) => state.addPlayerAction);

  const [cxrViewed, setCxrViewed] = useState(false);

  const isOpen = activeModal === "cxr";

  const handleViewCXR = () => {
    if (!scenario?.cxr_findings || cxrViewed) return;

    setCxrViewed(true);

    const findings = scenario.cxr_findings;

    addPlayerAction("cxr", "查看胸部 X 光", {
      finding: findings.finding,
    });

    addMessage({
      role: "system",
      content: `【胸部 X 光 (CXR)】\n${findings.finding}`,
    });
  };

  const cxr = scenario?.cxr_findings;
  const hasCXR = !!cxr;

  return (
    <Dialog open={isOpen} onOpenChange={() => setActiveModal(null)}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            胸部 X 光 (Chest X-Ray)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!hasCXR ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                此情境未提供胸部 X 光資料。
              </CardContent>
            </Card>
          ) : (
            <Card className={cxrViewed ? "border-green-200 dark:border-green-800" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      Portable CXR (PA view)
                      {cxrViewed && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      床邊胸部 X 光
                    </div>
                  </div>

                  <Button
                    variant={cxrViewed ? "secondary" : "default"}
                    size="sm"
                    onClick={handleViewCXR}
                    disabled={cxrViewed}
                    className="gap-1"
                  >
                    <ImageIcon className="h-3 w-3" />
                    {cxrViewed ? "已查看" : "查看"}
                  </Button>
                </div>

                {cxrViewed && (
                  <>
                    {/* CXR Image */}
                    {cxr.image && (
                      <div className="mb-4">
                        <div className="bg-black rounded-lg overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cxr.image}
                            alt="Chest X-Ray"
                            className="w-full h-auto object-contain max-h-[50vh]"
                          />
                        </div>
                        {cxr.source && (
                          <div className="mt-1 text-xs text-muted-foreground text-center">
                            Source: {cxr.source} | {cxr.license}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Findings */}
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">
                        Findings:
                      </div>
                      <div className="text-sm mb-2">{cxr.finding}</div>

                      {cxr.findings_list && cxr.findings_list.length > 0 && (
                        <ul className="text-sm space-y-1 mt-2">
                          {cxr.findings_list.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-muted-foreground">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
