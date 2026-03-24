"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/store";
import { BookOpen, Zap } from "lucide-react";
import type { DifficultyLevel } from "@/lib/types";

interface DifficultyOption {
  level: DifficultyLevel;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  time: string;
  recommended?: boolean;
  comingSoon?: boolean;
}

const difficulties: DifficultyOption[] = [
  {
    level: "standard",
    icon: BookOpen,
    title: "📚 Standard",
    subtitle: "引導模擬",
    description: "護理師會給你提示，藥物從清單選擇，生命徵象有顏色標示。適合學習 pattern recognition。",
    features: [
      "護理師主動提示",
      "預設藥物清單",
      "生命徵象顏色標示",
      "60 秒急救倒數計時",
      "Checklist 式回顧",
    ],
    time: "15 分鐘",
    recommended: true,
    comingSoon: false,
  },
  {
    level: "pro",
    icon: Zap,
    title: "🏥 Pro",
    subtitle: "完整模擬",
    description: "跟真正值班一樣。自由對話、自己開醫囑、沒有提示。你能獨立處理嗎？",
    features: [
      "自由文字對話",
      "完整藥物開立",
      "AI 評估交班報告",
      "無提示",
    ],
    time: "30 分鐘",
    comingSoon: false,
  },
];

export function DifficultySelect() {
  const setDifficulty = useGameStore((state) => state.setDifficulty);

  const handleSelect = (level: DifficultyLevel) => {
    setDifficulty(level);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">ICU Simulator</h1>
          <p className="text-muted-foreground text-lg">
            你能撐過這個值班嗎？
          </p>
        </div>

        {/* Difficulty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {difficulties.map((diff) => (
            <Card
              key={diff.level}
              className={`relative cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                diff.recommended ? "ring-2 ring-primary" : ""
              } ${diff.comingSoon ? "opacity-60" : ""}`}
              onClick={() => !diff.comingSoon && handleSelect(diff.level)}
            >
              {diff.recommended && (
                <Badge className="absolute -top-2 left-4 bg-primary">
                  推薦
                </Badge>
              )}
              {diff.comingSoon && (
                <Badge variant="secondary" className="absolute -top-2 right-4">
                  即將推出
                </Badge>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">{diff.title}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{diff.subtitle}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{diff.description}</p>
                <div className="space-y-1">
                  {diff.features.map((f, i) => (
                    <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-green-500">✓</span> {f}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">⏱ {diff.time}</span>
                  <Button
                    size="sm"
                    variant={diff.recommended ? "default" : "outline"}
                    disabled={diff.comingSoon}
                  >
                    {diff.comingSoon ? "即將推出" : "開始"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
