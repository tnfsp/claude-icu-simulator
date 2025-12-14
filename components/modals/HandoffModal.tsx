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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/store";
import {
  Phone,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import type { HandoffFeedback } from "@/lib/types";

export function HandoffModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const scenario = useGameStore((state) => state.scenario);
  const orderedLabs = useGameStore((state) => state.orderedLabs);
  const orderedMedications = useGameStore((state) => state.orderedMedications);
  const examinedItems = useGameStore((state) => state.examinedItems);
  const pocusExamined = useGameStore((state) => state.pocusExamined);
  const setHandoffReport = useGameStore((state) => state.setHandoffReport);
  const setHandoffFeedback = useGameStore((state) => state.setHandoffFeedback);
  const endGame = useGameStore((state) => state.endGame);

  const [reportContent, setReportContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<HandoffFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const isOpen = activeModal === "handoff";

  const isFormValid = () => {
    return reportContent.trim().length >= 30;
  };

  const handleSubmit = async () => {
    if (!isFormValid() || !scenario) return;

    setIsLoading(true);
    setHandoffReport({ content: reportContent });

    try {
      const response = await fetch("/api/evaluate-handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report: { content: reportContent },
          scenario,
          actions: {
            orderedLabs,
            orderedMedications,
            examinedItems,
            pocusExamined,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate handoff");
      }

      const data = await response.json();
      setFeedback(data.feedback);
      setHandoffFeedback(data.feedback);
      setShowFeedback(true);
    } catch (error) {
      console.error("Handoff evaluation error:", error);
      const defaultFeedback: HandoffFeedback = {
        overall: "good",
        score: 70,
        strengths: ["完成交班報告"],
        missedPoints: ["無法取得 AI 評估"],
        suggestions: ["請稍後再試"],
        seniorComment: "系統暫時無法評估，請稍後再試。",
      };
      setFeedback(defaultFeedback);
      setShowFeedback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    endGame(scenario?.diagnosis.primary || "unknown");
    setActiveModal("debrief");
  };

  const handleClose = () => {
    if (!showFeedback) {
      setReportContent("");
    }
    setActiveModal(null);
  };

  const getOverallIcon = (overall: HandoffFeedback["overall"]) => {
    switch (overall) {
      case "excellent":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "good":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "needs_improvement":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getOverallLabel = (overall: HandoffFeedback["overall"]) => {
    switch (overall) {
      case "excellent":
        return "優秀";
      case "good":
        return "良好";
      case "needs_improvement":
        return "需加強";
    }
  };

  const getOverallColor = (overall: HandoffFeedback["overall"]) => {
    switch (overall) {
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "good":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "needs_improvement":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            電話交班
          </DialogTitle>
          <DialogDescription>
            假設你現在打電話給學長，請口頭報告這位病人的狀況
          </DialogDescription>
        </DialogHeader>

        {!showFeedback ? (
          <>
            <div className="py-4">
              {/* Phone call simulation hint */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p className="font-medium mb-1">📞 學長接起電話了...</p>
                <p>「喂，我是 ICU VS，你說。」</p>
              </div>

              {/* Single textarea for free-form handoff */}
              <Textarea
                placeholder="學長好，我是值班 R1，我要向您報告 15 床的病人..."
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                className="min-h-[250px] text-base leading-relaxed"
              />

              <p className="text-xs text-muted-foreground mt-2">
                像真的打電話一樣，完整報告病人情況、你的判斷、以及處置計畫
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={!isFormValid() || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    學長評估中...
                  </>
                ) : (
                  "報告完畢"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : feedback ? (
          <>
            {/* Feedback View */}
            <div className="space-y-4 py-4">
              {/* Overall Score */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getOverallIcon(feedback.overall)}
                      <span className="font-medium">整體評價</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getOverallColor(feedback.overall)}>
                        {getOverallLabel(feedback.overall)}
                      </Badge>
                      <span className="text-2xl font-bold">{feedback.score}</span>
                      <span className="text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Senior Comment */}
              <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                        學長回饋
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                        {feedback.seniorComment}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              {feedback.strengths.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    做得好的地方
                  </h4>
                  <ul className="space-y-1">
                    {feedback.strengths.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missed Points */}
              {feedback.missedPoints.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    遺漏的重點
                  </h4>
                  <ul className="space-y-1">
                    {feedback.missedPoints.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-500">!</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {feedback.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                    改善建議
                  </h4>
                  <ul className="space-y-1">
                    {feedback.suggestions.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-500">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleFinish}>
                查看 Debrief
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
