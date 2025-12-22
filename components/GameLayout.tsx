"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { VitalSignsPanel } from "@/components/VitalSignsPanel";
import { StatusPanel } from "@/components/StatusPanel";
import { ChatArea } from "@/components/ChatArea";
import { ActionPanel } from "@/components/ActionPanel";
import {
  PhysicalExamModal,
  LabOrderModal,
  LabResultsModal,
  POCUSModal,
  OrdersModal,
  HandoffModal,
  DebriefModal,
} from "@/components/modals";
import { useGameStore } from "@/lib/store";
import { Play, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import type { Scenario } from "@/lib/types";

// Default scenario ID to load
const DEFAULT_SCENARIO_ID = "cardiogenic-shock-01";

export function GameLayout() {
  const scenario = useGameStore((state) => state.scenario);
  const isLoading = useGameStore((state) => state.isLoading);
  const loadError = useGameStore((state) => state.loadError);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const gameEnded = useGameStore((state) => state.gameEnded);
  const setScenario = useGameStore((state) => state.setScenario);
  const setLoading = useGameStore((state) => state.setLoading);
  const setLoadError = useGameStore((state) => state.setLoadError);
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);

  // Load scenario from API
  const loadScenario = useCallback(async (scenarioId: string) => {
    setLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/scenario?id=${scenarioId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load scenario");
      }

      const scenarioData: Scenario = await response.json();
      setScenario(scenarioData);
    } catch (error) {
      console.error("Error loading scenario:", error);
      setLoadError(error instanceof Error ? error.message : "Failed to load scenario");
    } finally {
      setLoading(false);
    }
  }, [setScenario, setLoading, setLoadError]);

  // Load default scenario on mount
  useEffect(() => {
    loadScenario(DEFAULT_SCENARIO_ID);
  }, [loadScenario]);

  const handleStartGame = () => {
    startGame();
  };

  const handleResetGame = () => {
    resetGame();
    loadScenario(DEFAULT_SCENARIO_ID);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-3 md:px-4 py-2 md:py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <h1 className="text-lg md:text-xl font-bold whitespace-nowrap">ICU Simulator</h1>
          {scenario && (
            <span className="text-xs md:text-sm text-muted-foreground bg-muted px-2 py-1 rounded truncate max-w-[150px] md:max-w-none hidden sm:inline-block">
              {scenario.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!gameStarted && !isLoading && scenario && (
            <Button onClick={handleStartGame} className="gap-1 md:gap-2" size="sm">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">開始情境</span>
              <span className="sm:hidden">開始</span>
            </Button>
          )}
          {(gameStarted || gameEnded) && (
            <Button variant="outline" onClick={handleResetGame} className="gap-1 md:gap-2" size="sm">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">重新開始</span>
              <span className="sm:hidden">重置</span>
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
        ) : loadError ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-destructive">{loadError}</p>
              <Button onClick={() => loadScenario(DEFAULT_SCENARIO_ID)}>
                重試
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Left Panel - Vitals & Status (hidden on small screens) */}
            <aside className="hidden md:flex w-56 lg:w-64 xl:w-72 border-r p-3 lg:p-4 flex-col gap-3 lg:gap-4 overflow-y-auto flex-shrink-0">
              <VitalSignsPanel />
              <StatusPanel />
            </aside>

            {/* Right Panel - Chat & Actions */}
            <div className="flex-1 flex flex-col min-w-0 p-3 md:p-4 gap-3 md:gap-4">
              {/* Mobile Vitals Summary */}
              <div className="md:hidden">
                <VitalSignsPanel />
              </div>
              <ChatArea />
              <ActionPanel />
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <PhysicalExamModal />
      <LabOrderModal />
      <LabResultsModal />
      <POCUSModal />
      <OrdersModal />
      <HandoffModal />
      <DebriefModal />
    </div>
  );
}
