"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VitalSignsPanel } from "@/components/VitalSignsPanel";
import { StatusPanel } from "@/components/StatusPanel";
import { ChatArea } from "@/components/ChatArea";
import { ActionPanel } from "@/components/ActionPanel";
import { useGameStore } from "@/lib/store";
import { Play, RotateCcw, Loader2 } from "lucide-react";
import type { Scenario } from "@/lib/types";

// Demo scenario for development (will be replaced by API)
const demoScenario: Scenario = {
  id: "cardiogenic-shock-01",
  title: "Cardiogenic Shock Mimicking Sepsis",
  difficulty: "intermediate",
  author: "ICU Simulator",
  version: "1.0",
  opening: {
    caller: "護理師",
    message:
      "醫師，床號 15 的病人看起來怪怪的，血壓有點低，你要不要來看一下？",
  },
  patient: {
    age: 68,
    gender: "M",
    bed: "15",
    brief_history: "HTN, DM, 三天前 STEMI s/p primary PCI to LAD",
  },
  initial_vitals: {
    hr: 120,
    bp_systolic: 78,
    bp_diastolic: 45,
    rr: 28,
    spo2: 94,
    temperature: 37.2,
  },
  current_status: {
    consciousness: "Alert but anxious",
    appearance: "蒼白、冒汗、四肢冰冷",
  },
  history_context: {
    description:
      "病人三天前因 STEMI 接受 PCI，今天早上開始覺得喘，現在喘得更厲害了。",
    key_points: [
      "沒有發燒",
      "沒有咳嗽、痰",
      "尿量減少",
      "從昨晚開始覺得喘，今天更喘",
    ],
  },
  physical_exam: {
    general: "看起來不舒服，端坐呼吸",
    cardiac: {
      jvp: "Elevated, ~12 cmH2O",
      heart_sound: "S3 gallop present, no murmur",
      pmi: "Displaced laterally",
    },
    pulmonary: {
      breath_sounds: "Bilateral basilar crackles",
      percussion: "Dull at bases",
    },
    abdomen: "Soft, mild RUQ tenderness, liver palpable",
    extremities: {
      edema: "2+ bilateral pedal edema",
      pulse: "Weak, thready",
      capillary_refill: "> 3 seconds",
      temperature: "Cold",
    },
  },
  lab_results: {
    cbc: { wbc: 9.8, hb: 12.1, hct: 36.3, platelet: 178 },
    biochemistry: { bun: 45, cr: 1.8, na: 134, k: 4.8, ast: 56, alt: 42 },
    cardiac: { troponin_i: 2.4, nt_probnp: 8500 },
    infection: { procalcitonin: 0.3, lactate: 4.2, crp: 2.1 },
    abg: { ph: 7.32, pco2: 32, po2: 68, hco3: 18, be: -6, sao2: 92 },
    coagulation: { pt_inr: 1.2, aptt: 34, d_dimer: 1.8 },
  },
  pocus_findings: {
    plax: {
      video: "echo-plax.mp4",
      finding: "Severely reduced LV function, EF ~20%",
    },
    a4c: {
      video: "echo-a4c.mp4",
      finding: "Dilated LV, global hypokinesis",
    },
    ivc: {
      video: "echo-ivc.mp4",
      finding: "Dilated IVC > 2.1cm, < 50% collapse",
    },
    lung: {
      image: "lung-us.jpg",
      finding: "Multiple B-lines bilaterally",
    },
  },
  diagnosis: {
    primary: "Cardiogenic shock",
    differential: ["Septic shock", "Hypovolemic shock"],
    key_differentiators: [
      "Elevated JVP (不像 septic shock)",
      "Cold extremities (septic shock 通常 warm)",
      "Low procalcitonin",
      "Poor LV function on echo",
      "Dilated non-collapsing IVC",
    ],
  },
  optimal_management: {
    avoid: [{ action: "大量輸液", reason: "會加重肺水腫" }],
    recommended: [
      { action: "Norepinephrine", detail: "0.05-0.1 mcg/kg/min 起始" },
      { action: "Dobutamine", detail: "2.5-5 mcg/kg/min，改善 cardiac output" },
      { action: "Furosemide", detail: "若有明顯 congestion" },
      { action: "考慮照會心臟科", detail: "評估是否需 IABP 或其他 MCS" },
    ],
  },
  learning_points: [
    "Cardiogenic shock 可能因低灌流而有 elevated lactate，容易誤認為 sepsis",
    "Physical exam 的 JVP 和四肢溫度是重要鑑別點",
    "Bedside echo 可快速區分 cardiogenic vs distributive shock",
    "對 cardiogenic shock 給大量輸液會惡化病情",
  ],
};

export function GameLayout() {
  const scenario = useGameStore((state) => state.scenario);
  const isLoading = useGameStore((state) => state.isLoading);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const gameEnded = useGameStore((state) => state.gameEnded);
  const setScenario = useGameStore((state) => state.setScenario);
  const setLoading = useGameStore((state) => state.setLoading);
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);

  // Load demo scenario on mount
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setScenario(demoScenario);
      setLoading(false);
    }, 500);
  }, [setScenario, setLoading]);

  const handleStartGame = () => {
    startGame();
  };

  const handleResetGame = () => {
    resetGame();
    setScenario(demoScenario);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">ICU Simulator</h1>
          {scenario && (
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              {scenario.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!gameStarted && !isLoading && scenario && (
            <Button onClick={handleStartGame} className="gap-2">
              <Play className="h-4 w-4" />
              開始情境
            </Button>
          )}
          {(gameStarted || gameEnded) && (
            <Button variant="outline" onClick={handleResetGame} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              重新開始
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Left Panel - Vitals & Status */}
            <aside className="w-64 lg:w-72 border-r p-4 flex flex-col gap-4 overflow-y-auto flex-shrink-0">
              <VitalSignsPanel />
              <StatusPanel />
            </aside>

            {/* Right Panel - Chat & Actions */}
            <div className="flex-1 flex flex-col min-w-0 p-4 gap-4">
              <ChatArea />
              <ActionPanel />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
