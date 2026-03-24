"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGameStore } from "@/lib/store";
import {
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  Clock,
  Trophy,
} from "lucide-react";

/**
 * StandardDebrief — Checklist-based debrief for Standard mode.
 * Shows scoring breakdown, completed/missed actions, and learning points.
 */
export function StandardDebrief() {
  const activeModal = useGameStore((state) => state.activeModal);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const scenario = useGameStore((state) => state.scenario);
  const standardOverlay = useGameStore((state) => state.standardOverlay);
  const standardScore = useGameStore((state) => state.standardScore);
  const completedScoringActions = useGameStore((state) => state.completedScoringActions);
  const playerActions = useGameStore((state) => state.playerActions);
  const orderedMedications = useGameStore((state) => state.orderedMedications);
  const resetGame = useGameStore((state) => state.resetGame);
  const setDifficulty = useGameStore((state) => state.setDifficulty);

  const isOpen = activeModal === "debrief";

  if (!scenario || !standardOverlay) return null;

  const maxScore = standardOverlay.scoring.maxScore;
  const scorePercentage = Math.max(0, Math.round((standardScore / maxScore) * 100));

  // Check avoid_fluid_bolus
  const gaveFluids = orderedMedications.some(
    (m) =>
      m.name.toLowerCase().includes("saline") ||
      m.name.toLowerCase().includes("ringer") ||
      m.name.toLowerCase().includes("albumin")
  );

  // Build checklist
  const checklist = standardOverlay.scoring.keyActions.map((action) => {
    let completed = completedScoringActions.includes(action.id);

    // Special check for avoid_fluid
    if (action.id === "avoid_fluid" && !gaveFluids) {
      completed = true;
    }

    return {
      ...action,
      completed,
    };
  });

  const completedCount = checklist.filter((c) => c.completed).length;
  const totalCount = checklist.length;

  // Rating
  const getRating = () => {
    if (scorePercentage >= 80) return { emoji: "🌟", label: "優秀！", color: "text-green-600" };
    if (scorePercentage >= 60) return { emoji: "👍", label: "不錯！", color: "text-blue-600" };
    if (scorePercentage >= 40) return { emoji: "📚", label: "繼續加油", color: "text-yellow-600" };
    return { emoji: "💪", label: "再試一次", color: "text-orange-600" };
  };

  const rating = getRating();

  const handleClose = () => {
    setActiveModal(null);
  };

  const handleRestart = () => {
    resetGame();
    setActiveModal(null);
  };

  const handleTryPro = () => {
    resetGame();
    setDifficulty("pro");
    setActiveModal(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            案例回顧 — Standard Mode
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4">
            {/* Score Summary */}
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl mb-1">{rating.emoji}</div>
                    <div className={`text-lg font-bold ${rating.color}`}>
                      {rating.label}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{Math.max(0, standardScore)}</div>
                    <div className="text-sm text-muted-foreground">/ {maxScore} 分</div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      scorePercentage >= 80
                        ? "bg-green-500"
                        : scorePercentage >= 60
                        ? "bg-blue-500"
                        : scorePercentage >= 40
                        ? "bg-yellow-500"
                        : "bg-orange-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, scorePercentage))}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  完成 {completedCount}/{totalCount} 項關鍵動作
                </div>
              </CardContent>
            </Card>

            {/* Action Checklist */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  關鍵動作 Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2 p-2 rounded-lg ${
                        item.completed
                          ? "bg-green-50 dark:bg-green-950/20"
                          : "bg-red-50 dark:bg-red-950/20"
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.points} 分 {item.required ? "(必要)" : "(加分)"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wrong Treatment Warning */}
            {gaveFluids && (
              <Card className="border-red-300 dark:border-red-700">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-red-600 dark:text-red-400">
                        ⚠️ 不適當處置
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        你給了病人輸液。這個病人是 Cardiogenic Shock，已經 volume overload，
                        給輸液會加重肺水腫。記住：不是所有低血壓都要打點滴！
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Learning Points */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Lightbulb className="h-5 w-5" />
                  學習重點
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  {scenario.learning_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Action Timeline */}
            {playerActions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    操作歷程
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {playerActions
                      .filter((a) => a.type !== "game_start" && a.type !== "game_end")
                      .map((action) => (
                        <div
                          key={action.id}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="text-muted-foreground min-w-[50px]">
                            {new Date(action.timestamp).toLocaleTimeString("zh-TW", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                          <span>{action.detail}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            關閉
          </Button>
          <Button variant="outline" onClick={handleRestart}>
            再試一次
          </Button>
          <Button onClick={handleTryPro}>
            <Trophy className="h-4 w-4 mr-1" />
            挑戰 Pro 模式
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
