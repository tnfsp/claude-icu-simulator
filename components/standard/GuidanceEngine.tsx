"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "@/lib/store";
import type { NurseHintTrigger, VitalColorRanges } from "@/lib/types";

/**
 * GuidanceEngine — runs as a background effect in Standard mode.
 * Checks nurse hint triggers every 5 seconds and fires hints accordingly.
 * Renders nothing visible (hints are shown via NurseHintBubble).
 */
export function GuidanceEngine() {
  const gameStarted = useGameStore((state) => state.gameStarted);
  const gameEnded = useGameStore((state) => state.gameEnded);
  const standardOverlay = useGameStore((state) => state.standardOverlay);
  const playerActions = useGameStore((state) => state.playerActions);
  const nurseHints = useGameStore((state) => state.nurseHints);
  const vitals = useGameStore((state) => state.vitals);
  const gameStartedAt = useGameStore((state) => state.gameStartedAt);
  const pocusExamined = useGameStore((state) => state.pocusExamined);
  const examinedItems = useGameStore((state) => state.examinedItems);
  const orderedMedications = useGameStore((state) => state.orderedMedications);
  const addNurseHint = useGameStore((state) => state.addNurseHint);
  const addMessage = useGameStore((state) => state.addMessage);

  const addStandardScore = useGameStore((state) => state.addStandardScore);
  const addCompletedScoringAction = useGameStore((state) => state.addCompletedScoringAction);
  const completedScoringActions = useGameStore((state) => state.completedScoringActions);

  const firedTriggerIds = useRef<Set<string>>(new Set());
  const gameStartHintFired = useRef(false);

  const checkTriggers = useCallback(() => {
    if (!gameStarted || gameEnded || !standardOverlay || !gameStartedAt) return;

    const now = Date.now();
    const triggers = standardOverlay.nurseHintTriggers;

    for (const trigger of triggers) {
      // Skip if already fired
      if (firedTriggerIds.current.has(trigger.id)) continue;

      let shouldFire = false;

      switch (trigger.condition.type) {
        case "game_start": {
          if (!gameStartHintFired.current) {
            const elapsed = (now - gameStartedAt) / 1000;
            if (elapsed >= trigger.delaySeconds) {
              shouldFire = true;
              gameStartHintFired.current = true;
            }
          }
          break;
        }

        case "no_action_for": {
          const lastAction = playerActions.filter(
            (a) => a.type !== "game_start" && a.type !== "game_end"
          ).at(-1);
          const lastTime = lastAction
            ? new Date(lastAction.timestamp).getTime()
            : gameStartedAt;
          const idleSeconds = (now - lastTime) / 1000;
          if (idleSeconds >= trigger.condition.seconds) {
            shouldFire = true;
          }
          break;
        }

        case "no_pocus_after": {
          const elapsed = (now - gameStartedAt) / 1000;
          if (elapsed >= trigger.condition.seconds && pocusExamined.length === 0) {
            shouldFire = true;
          }
          break;
        }

        case "missed_action": {
          const elapsed = (now - gameStartedAt) / 1000;
          if (elapsed >= trigger.condition.bySeconds) {
            const actionName = trigger.condition.action;
            // Check if the action was performed
            if (actionName === "physical_exam") {
              if (examinedItems.length === 0) shouldFire = true;
            } else if (actionName === "pocus") {
              if (pocusExamined.length === 0) shouldFire = true;
            }
          }
          break;
        }

        case "wrong_action": {
          if (trigger.condition.action === "fluid_bolus") {
            const gaveFluids = orderedMedications.some(
              (m) =>
                m.name.toLowerCase().includes("saline") ||
                m.name.toLowerCase().includes("ringer") ||
                m.name.toLowerCase().includes("albumin")
            );
            if (gaveFluids) shouldFire = true;
          }
          break;
        }

        case "vitals_critical": {
          if (vitals && standardOverlay.vitalRanges) {
            const vital = trigger.condition.vital;
            const ranges = standardOverlay.vitalRanges;
            let value: number | undefined;

            if (vital === "hr") value = vitals.hr;
            else if (vital === "bp_systolic") value = vitals.bp_systolic;
            else if (vital === "rr") value = vitals.rr;
            else if (vital === "spo2") value = vitals.spo2;
            else if (vital === "temperature") value = vitals.temperature;

            if (value !== undefined) {
              const range = ranges[vital as keyof VitalColorRanges];
              if (range) {
                const isRed =
                  value < range.green[0] && value < range.yellow[0];
                const isRedHigh =
                  value > range.green[1] && value > range.yellow[1];
                if (isRed || isRedHigh) shouldFire = true;
              }
            }
          }
          break;
        }
      }

      if (shouldFire) {
        firedTriggerIds.current.add(trigger.id);

        // Add to hints store
        addNurseHint({
          triggerId: trigger.id,
          text: trigger.hint,
          priority: trigger.priority,
          dismissed: false,
        });

        // Also add as a nurse message in the chat
        addMessage({
          role: "nurse",
          content: `💡 ${trigger.hint}`,
        });
      }
    }
  }, [
    gameStarted,
    gameEnded,
    standardOverlay,
    gameStartedAt,
    playerActions,
    pocusExamined,
    examinedItems,
    orderedMedications,
    vitals,
    addNurseHint,
    addMessage,
  ]);

  // Check and award scoring points for completed actions
  const checkScoring = useCallback(() => {
    if (!standardOverlay) return;

    const scoring = standardOverlay.scoring.keyActions;

    for (const action of scoring) {
      if (completedScoringActions.includes(action.id)) continue;

      let completed = false;

      switch (action.id) {
        case "pe_cardiac":
          completed = examinedItems.some(
            (e) => e.category === "cardiac" || e.item?.includes("cardiac")
          );
          break;
        case "pe_extremities":
          completed = examinedItems.some(
            (e) => e.category === "extremities" || e.item?.includes("extremities")
          );
          break;
        case "pocus_heart":
          completed = pocusExamined.some(
            (p) => p.view === "a4c" || p.view === "plax" || p.view === "psax"
          );
          break;
        case "pocus_ivc":
          completed = pocusExamined.some((p) => p.view === "ivc");
          break;
        case "avoid_fluid":
          // This is checked at debrief time, not during game
          break;
      }

      if (completed) {
        addCompletedScoringAction(action.id);
        addStandardScore(action.points);
      }
    }
  }, [standardOverlay, completedScoringActions, examinedItems, pocusExamined, addCompletedScoringAction, addStandardScore]);

  // Run check every 5 seconds
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    const interval = setInterval(() => {
      checkTriggers();
      checkScoring();
    }, 5000);
    // Also run immediately
    checkTriggers();
    checkScoring();

    return () => clearInterval(interval);
  }, [gameStarted, gameEnded, checkTriggers, checkScoring]);

  // Reset on game restart
  useEffect(() => {
    if (!gameStarted) {
      firedTriggerIds.current.clear();
      gameStartHintFired.current = false;
    }
  }, [gameStarted]);

  // Render nothing — this is a logic-only component
  return null;
}
