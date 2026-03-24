"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useGameStore } from "@/lib/store";
import { Timer, AlertTriangle } from "lucide-react";

/**
 * RescueCountdown — 60-second countdown timer for Standard mode.
 * Activates when vitals reach critical thresholds.
 * Shows a prominent countdown. When it reaches 0, nurse intervenes.
 */
export function RescueCountdown() {
  const vitals = useGameStore((state) => state.vitals);
  const standardOverlay = useGameStore((state) => state.standardOverlay);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const gameEnded = useGameStore((state) => state.gameEnded);
  const addMessage = useGameStore((state) => state.addMessage);
  const orderedMedications = useGameStore((state) => state.orderedMedications);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggered = useRef(false);
  const hasExpired = useRef(false);

  // Check if vitals are critical enough to start countdown
  useEffect(() => {
    if (!gameStarted || gameEnded || !vitals || !standardOverlay || hasTriggered.current) return;

    const ranges = standardOverlay.vitalRanges;
    const bpCritical = vitals.bp_systolic < ranges.bp_systolic.red[1];
    const spo2Critical = vitals.spo2 < ranges.spo2.red[1];

    if (bpCritical || spo2Critical) {
      // Start countdown
      hasTriggered.current = true;
      setCountdown(60);
      setIsActive(true);

      addMessage({
        role: "nurse",
        content: "⏱️ 醫師！病人狀況很不穩定！我們需要在 60 秒內做出處置！",
      });
    }
  }, [vitals, gameStarted, gameEnded, standardOverlay, addMessage]);

  // Countdown timer
  useEffect(() => {
    if (!isActive || countdown === null || countdown <= 0) return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isActive, countdown]);

  // Check if player has stabilized the patient (ordered vasopressor/inotrope)
  useEffect(() => {
    if (!isActive) return;

    const hasVasopressor = orderedMedications.some(
      (m) =>
        m.name.toLowerCase().includes("norepinephrine") ||
        m.name.toLowerCase().includes("epinephrine") ||
        m.name.toLowerCase().includes("dopamine") ||
        m.name.toLowerCase().includes("vasopressin")
    );
    const hasInotrope = orderedMedications.some(
      (m) =>
        m.name.toLowerCase().includes("dobutamine") ||
        m.name.toLowerCase().includes("milrinone")
    );

    if (hasVasopressor || hasInotrope) {
      // Patient stabilizing — stop countdown
      setIsActive(false);
      setCountdown(null);
      addMessage({
        role: "nurse",
        content: "👍 醫師，藥物開始作用了，血壓有在回升。繼續觀察中。",
      });
    }
  }, [orderedMedications, isActive, addMessage]);

  // Countdown expired
  useEffect(() => {
    if (countdown === 0 && !hasExpired.current) {
      hasExpired.current = true;
      addMessage({
        role: "nurse",
        content: "⏰ 60 秒到了！學長已經通知了，他正在趕過來。醫師，我們先繼續處理，你覺得現在最重要的是什麼？",
      });
    }
  }, [countdown, addMessage]);

  // Reset on game restart
  useEffect(() => {
    if (!gameStarted) {
      hasTriggered.current = false;
      hasExpired.current = false;
      setCountdown(null);
      setIsActive(false);
    }
  }, [gameStarted]);

  if (countdown === null || !isActive) return null;

  const isUrgent = countdown <= 20;
  const isCritical = countdown <= 10;

  return (
    <Card
      className={`border-2 transition-all ${
        isCritical
          ? "border-red-500 bg-red-50 dark:bg-red-950/30 animate-pulse"
          : isUrgent
          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
          : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30"
      }`}
    >
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="h-5 w-5 text-red-500 animate-bounce" />
          ) : (
            <Timer className="h-5 w-5 text-yellow-600" />
          )}
          <div>
            <div className="text-sm font-bold">
              {isCritical ? "🚨 緊急！" : "⏱️ 急救倒數"}
            </div>
            <div className="text-xs text-muted-foreground">
              趕快處置！
            </div>
          </div>
        </div>
        <div
          className={`text-3xl font-mono font-bold ${
            isCritical
              ? "text-red-600"
              : isUrgent
              ? "text-orange-600"
              : "text-yellow-600"
          }`}
        >
          {countdown}s
        </div>
      </CardContent>
    </Card>
  );
}
