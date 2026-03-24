# ICU Simulator — Difficulty System Design Document

> Author: Owl | Date: 2026-03-24
> Status: Draft — pending Wilson review

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Architecture Overview](#2-architecture-overview)
3. [Scenario Data Structure](#3-scenario-data-structure)
4. [Lite Mode — Visual Novel](#4-lite-mode--visual-novel)
5. [Standard Mode — Guided Simulation](#5-standard-mode--guided-simulation)
6. [Pro Mode — Current (Unchanged)](#6-pro-mode--current-unchanged)
7. [UX Flow & Level Selection](#7-ux-flow--level-selection)
8. [Implementation Plan](#8-implementation-plan)
9. [Open Questions](#9-open-questions)

---

## 1. Design Philosophy

### Core Insight: One Scenario, Three Lenses

The same clinical scenario (e.g., cardiogenic shock mimicking sepsis) tells different stories depending on who's playing:

| Level | Metaphor | Player Question |
|-------|----------|-----------------|
| **Lite** | 互動電影 | 「他會不會死？我該怎麼選？」 |
| **Standard** | 教練帶你打 | 「我知道該做什麼嗎？pattern 對不對？」 |
| **Pro** | 真正值班 | 「我能不能獨立處理？」 |

### Design Principles

1. **Single Source of Truth** — Pro scenario data is the canonical dataset. Standard and Lite derive from it, with overlays.
2. **Additive Layering** — Standard adds hints/color-coding to Pro. Lite adds narrative/choices on top of scenario events.
3. **No Dumbing Down** — Even Lite presents real medicine. The difference is scaffolding, not accuracy.
4. **Mobile-First for Lite** — IG audience = phone. Lite must be a beautiful mobile experience.
5. **Shareability** — Each level should have a shareable result/ending for social media.

---

## 2. Architecture Overview

### Directory Structure (Proposed)

```
lib/simulator/
  types.ts                    # Shared types (extended)
  store.ts                    # Core store (add difficulty slice)
  difficulty.ts               # Difficulty config & helpers
  scenarios/
    cardiogenic-shock-01/
      base.json               # Current scenario.json (Pro data = canonical)
      standard.json           # Standard overlay (nurse hints, simplified actions)
      lite.json               # Lite story beats & choices

components/simulator/
  DifficultySelect.tsx        # Level selection screen
  shared/
    VitalSignsPanel.tsx       # Shared, takes colorCoding prop
    ScenarioHeader.tsx
  lite/
    LiteGameLayout.tsx
    StoryPanel.tsx
    ChoiceCard.tsx
    ExplanationPanel.tsx
    LiteEndScreen.tsx
  standard/
    StandardGameLayout.tsx
    GuidedActionPanel.tsx
    NurseHintBubble.tsx
    SimplifiedOrderModal.tsx
  pro/
    (existing components, untouched)
```

### Routing

```
/simulator                     → DifficultySelect (landing)
/simulator/lite/[scenarioId]   → LiteGameLayout
/simulator/standard/[scenarioId] → StandardGameLayout
/simulator/pro/[scenarioId]    → ProGameLayout (current)
```

### Store Architecture

One Zustand store with a difficulty-aware slice pattern:

```typescript
// Option A: Single store + difficulty field (recommended)
// Keeps it simple. Lite has so different a flow that its state
// is mostly separate anyway (currentBeatIndex, choicesMade, etc.)

interface GameStore {
  difficulty: DifficultyLevel;
  setDifficulty: (level: DifficultyLevel) => void;

  // === Shared state ===
  scenario: BaseScenario | null;
  vitals: VitalSigns | null;
  gameStarted: boolean;
  gameEnded: boolean;

  // === Pro/Standard state ===
  messages: Message[];
  orderedLabs: OrderedLab[];
  orderedMedications: OrderedMedication[];
  // ... (existing)

  // === Lite state ===
  liteState: LiteGameState | null;

  // === Standard extensions ===
  nurseHints: NurseHint[];
  hintsUsed: number;
}
```

---

## 3. Scenario Data Structure

### TypeScript Types

```typescript
// ============================================
// Difficulty System Types
// ============================================

export type DifficultyLevel = 'lite' | 'standard' | 'pro';

// --- Base Scenario (current, renamed) ---
// Identical to current Scenario type — this is the Pro canonical data.
// All fields from the existing scenario.json remain unchanged.
export interface BaseScenario {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // scenario difficulty, not game mode
  author: string;
  version: string;
  opening: Opening;
  patient: Patient;
  initial_vitals: VitalSigns;
  current_status: CurrentStatus;
  history_context: HistoryContext;
  physical_exam: PhysicalExam;
  lab_results: LabResults;
  pocus_findings: POCUSFindings;
  diagnosis: Diagnosis;
  optimal_management: OptimalManagement;
  learning_points: string[];
  vital_transitions?: VitalTransition[];
  deterioration_thresholds?: DeteriorationThresholds;
  handoff_evaluation?: HandoffEvaluation;
}

// --- Standard Overlay ---
export interface StandardOverlay {
  scenarioId: string;
  version: string;

  // Nurse becomes a guide, not just a reporter
  nurseProfile: {
    personality: 'supportive';  // always supportive in standard
    hintTriggers: NurseHintTrigger[];
  };

  // Which actions are available (subset of Pro)
  availableActions: StandardAction[];

  // Simplified medication list (no free-text dosing)
  medicationPresets: MedicationPreset[];

  // Vitals color coding thresholds
  vitalRanges: VitalColorRanges;

  // Time settings
  timeSettings: {
    clockMultiplier: number;    // 0.5 = half speed
    deathEnabled: boolean;       // false = patient stabilizes at critical
    warningBeforeDeath: boolean; // true = nurse warns 30s before death
  };

  // Scoring rubric (simplified)
  scoring: {
    keyActions: ScoringAction[];   // must-do actions with points
    maxScore: number;
  };
}

export interface NurseHintTrigger {
  condition: HintCondition;
  delaySeconds: number;           // wait this long before hinting
  hint: string;                    // nurse says this
  priority: 'gentle' | 'urgent';  // gentle = suggestion, urgent = warning
}

export type HintCondition =
  | { type: 'no_action_for'; seconds: number }           // player idle
  | { type: 'wrong_action'; action: string }              // player did something bad
  | { type: 'missed_action'; action: string; bySeconds: number } // should have done X
  | { type: 'vitals_critical'; vital: keyof VitalSigns }  // vital hitting danger zone
  | { type: 'phase_start'; phase: string };               // scenario phase transition

export type StandardAction =
  | 'physical-exam'
  | 'lab-order'        // simplified: preset panels, not individual tests
  | 'pocus'
  | 'medication'       // preset medications, not free-text
  | 'lab-results'
  | 'handoff';
  // Removed: free-text chat with nurse (replaced by structured options)

export interface MedicationPreset {
  id: string;
  name: string;
  category: 'correct' | 'neutral' | 'harmful';
  display: string;          // "Norepinephrine 0.05 mcg/kg/min"
  explanation?: string;     // shown after selection
  triggersTransition?: string; // maps to vital_transitions trigger
}

export interface VitalColorRanges {
  hr: { green: [number, number]; yellow: [number, number]; red: [number, number] };
  bp_systolic: { green: [number, number]; yellow: [number, number]; red: [number, number] };
  rr: { green: [number, number]; yellow: [number, number]; red: [number, number] };
  spo2: { green: [number, number]; yellow: [number, number]; red: [number, number] };
  temperature: { green: [number, number]; yellow: [number, number]; red: [number, number] };
}

export interface ScoringAction {
  action: string;
  points: number;
  required: boolean;        // false = bonus points
  timeBonus?: number;       // extra points if done within N seconds
}

// --- Lite Overlay (Visual Novel) ---
export interface LiteOverlay {
  scenarioId: string;
  version: string;

  // Story metadata
  meta: {
    estimatedMinutes: number;  // "5 min read"
    emoji: string;              // for social sharing
    tagline: string;            // "值班那一晚：一個心臟科住院醫師的夜班"
    coverImage?: string;
  };

  // Story beats — the narrative backbone
  beats: StoryBeat[];

  // Endings
  endings: StoryEnding[];

  // Educational summary shown at the end
  debrief: LiteDebrief;
}

export interface StoryBeat {
  id: string;
  type: 'narration' | 'dialogue' | 'vitals_flash' | 'choice' | 'reveal' | 'transition';

  // Narration / Dialogue
  speaker?: 'narrator' | 'nurse' | 'you' | 'patient' | 'attending';
  text?: string;                   // Markdown-supported
  textZh?: string;                 // 中文 (primary for TW audience)

  // Vitals flash — show vitals dramatically
  vitalsSnapshot?: Partial<VitalSigns>;
  vitalsEmotion?: 'stable' | 'warning' | 'critical'; // drives animation

  // Choice
  choices?: StoryChoice[];

  // Reveal — explanation after choice
  explanation?: string;
  explanationZh?: string;

  // Flow control
  nextBeat?: string;               // default: next in array
  autoAdvanceMs?: number;          // auto-advance after N ms (0 = wait for tap)
  condition?: BeatCondition;       // conditional display

  // Visual
  mood?: 'calm' | 'tense' | 'critical' | 'relief'; // drives background color/animation
  sound?: string;                  // optional sound effect key
}

export interface StoryChoice {
  id: string;
  label: string;                   // "給大量輸液" / "先做超音波"
  labelZh?: string;
  emoji?: string;                  // 💉 / 🫀
  consequence: {
    nextBeat: string;              // jump to this beat
    outcome: 'good' | 'neutral' | 'bad';
    shortFeedback: string;         // "✅ 好選擇！" / "⚠️ 小心..."
    scoreChange?: number;
  };
}

export interface BeatCondition {
  type: 'choice_was';
  choiceId: string;
  value: string;
}

export interface StoryEnding {
  id: string;
  condition: {
    minScore?: number;
    requiredChoices?: string[];     // choice IDs that must have been picked
  };
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  emoji: string;
  shareText: string;                // for social sharing
  rating: 1 | 2 | 3 | 4 | 5;      // star rating
}

export interface LiteDebrief {
  whatHappened: string;             // plain language summary
  whatHappenedZh: string;
  keyTakeaways: Array<{
    point: string;
    pointZh: string;
    icon: string;
  }>;
  realWorldNote: string;            // "在真實 ICU 裡，這種情況..."
  realWorldNoteZh: string;
  ctaText?: string;                 // "想學更多？試試 Standard 模式"
}

// --- Composite Scenario (loaded at runtime) ---
export interface GameScenario {
  base: BaseScenario;
  standard?: StandardOverlay;
  lite?: LiteOverlay;
}
```

### Example: Standard Overlay for Cardiogenic Shock

```json
{
  "scenarioId": "cardiogenic-shock-01",
  "version": "1.0",
  "nurseProfile": {
    "personality": "supportive",
    "hintTriggers": [
      {
        "condition": { "type": "no_action_for", "seconds": 45 },
        "delaySeconds": 0,
        "hint": "醫師，病人看起來不太好耶...要不要先看一下 vital signs 有什麼線索？",
        "priority": "gentle"
      },
      {
        "condition": { "type": "wrong_action", "action": "NS_bolus_1000" },
        "delaySeconds": 5,
        "hint": "醫師，我剛打了 1000 mL 進去，可是病人好像更喘了...要不要重新想一下？這個病人的 JVP 本來就很高耶...",
        "priority": "urgent"
      },
      {
        "condition": { "type": "missed_action", "action": "pocus", "bySeconds": 120 },
        "delaySeconds": 0,
        "hint": "醫師，我們有床邊超音波，要不要照一下看看心臟功能？可能會有幫助。",
        "priority": "gentle"
      },
      {
        "condition": { "type": "phase_start", "phase": "initial_assessment" },
        "delaySeconds": 10,
        "hint": "病人血壓蠻低的，你覺得是什麼原因？要不要先做個理學檢查？",
        "priority": "gentle"
      }
    ]
  },
  "availableActions": [
    "physical-exam",
    "lab-order",
    "pocus",
    "medication",
    "lab-results",
    "handoff"
  ],
  "medicationPresets": [
    {
      "id": "ns_500",
      "name": "Normal Saline 500mL",
      "category": "harmful",
      "display": "生理食鹽水 500 mL 快速輸注",
      "explanation": "⚠️ 這個病人是 cardiogenic shock，已經 volume overload 了。給輸液會讓肺水腫更嚴重！",
      "triggersTransition": "NS"
    },
    {
      "id": "norepi",
      "name": "Norepinephrine",
      "category": "correct",
      "display": "Norepinephrine 0.05 mcg/kg/min",
      "explanation": "✅ 正確！Norepinephrine 可以維持血壓，而且對心臟的 afterload 影響相對可接受。",
      "triggersTransition": "norepinephrine"
    },
    {
      "id": "dobutamine",
      "name": "Dobutamine",
      "category": "correct",
      "display": "Dobutamine 5 mcg/kg/min",
      "explanation": "✅ 正確！Dobutamine 是 inotrope，可以增加 cardiac output，正是這個病人需要的。",
      "triggersTransition": "dobutamine"
    },
    {
      "id": "furosemide",
      "name": "Furosemide",
      "category": "correct",
      "display": "Furosemide 40 mg IV",
      "explanation": "✅ 好選擇！病人有 pulmonary congestion，利尿可以改善呼吸。",
      "triggersTransition": "furosemide"
    },
    {
      "id": "dopamine",
      "name": "Dopamine",
      "category": "neutral",
      "display": "Dopamine 10 mcg/kg/min",
      "explanation": "⚠️ 可以用，但 Dopamine 比 Norepinephrine 更容易造成心律不整。目前 guidelines 較不推薦作為第一線。"
    },
    {
      "id": "broad_abx",
      "name": "Broad-spectrum Antibiotics",
      "category": "neutral",
      "display": "Tazocin 4.5g IV",
      "explanation": "⚠️ 如果真的是 sepsis 的話會需要，但目前 procalcitonin 很低 (0.3)，而且 echo 顯示嚴重心衰。先確認診斷比較重要。"
    }
  ],
  "vitalRanges": {
    "hr": { "green": [60, 100], "yellow": [100, 120], "red": [120, 999] },
    "bp_systolic": { "green": [90, 140], "yellow": [70, 90], "red": [0, 70] },
    "rr": { "green": [12, 20], "yellow": [20, 28], "red": [28, 999] },
    "spo2": { "green": [95, 100], "yellow": [90, 95], "red": [0, 90] },
    "temperature": { "green": [36.0, 37.5], "yellow": [37.5, 38.5], "red": [38.5, 999] }
  },
  "timeSettings": {
    "clockMultiplier": 0.5,
    "deathEnabled": false,
    "warningBeforeDeath": true
  },
  "scoring": {
    "keyActions": [
      { "action": "physical_exam_cardiac", "points": 10, "required": true },
      { "action": "physical_exam_extremities", "points": 10, "required": true },
      { "action": "pocus_a4c", "points": 15, "required": true },
      { "action": "pocus_ivc", "points": 10, "required": false },
      { "action": "order_norepinephrine", "points": 15, "required": true },
      { "action": "order_dobutamine", "points": 15, "required": true },
      { "action": "order_furosemide", "points": 10, "required": false },
      { "action": "avoid_fluid_bolus", "points": 15, "required": true, "timeBonus": 5 }
    ],
    "maxScore": 100
  }
}
```

### Example: Lite Overlay for Cardiogenic Shock (abbreviated)

```json
{
  "scenarioId": "cardiogenic-shock-01",
  "version": "1.0",
  "meta": {
    "estimatedMinutes": 5,
    "emoji": "🫀",
    "tagline": "值班那一晚 — 當血壓掉下來的時候",
    "coverImage": "/scenarios/cardiogenic-shock-01/cover.webp"
  },
  "beats": [
    {
      "id": "intro",
      "type": "narration",
      "textZh": "凌晨三點，你的手機響了。\n\n你是心臟外科的住院醫師，正在值班室裡勉強入睡。",
      "mood": "calm",
      "autoAdvanceMs": 3000
    },
    {
      "id": "nurse_call",
      "type": "dialogue",
      "speaker": "nurse",
      "textZh": "醫師，15 床的陳先生看起來怪怪的，血壓有點低，你要不要來看一下？",
      "mood": "tense",
      "autoAdvanceMs": 0
    },
    {
      "id": "context",
      "type": "narration",
      "textZh": "陳先生，68 歲，三天前因為急性心肌梗塞做了心導管手術。術後恢復得不錯，本來預計明天出院。\n\n但今晚，他的血壓掉到了 78/45。",
      "mood": "tense",
      "autoAdvanceMs": 4000
    },
    {
      "id": "vitals_1",
      "type": "vitals_flash",
      "vitalsSnapshot": { "hr": 120, "bp_systolic": 78, "bp_diastolic": 45, "spo2": 94 },
      "vitalsEmotion": "warning",
      "autoAdvanceMs": 2500
    },
    {
      "id": "first_look",
      "type": "narration",
      "textZh": "你走到床邊。陳先生蒼白、冒著冷汗，呼吸急促。他的手腳摸起來冰冰的。\n\n這是休克 — 身體的血液循環出了大問題。但是，是什麼原因？",
      "mood": "tense",
      "autoAdvanceMs": 0
    },
    {
      "id": "choice_1",
      "type": "choice",
      "textZh": "你的第一個念頭是？",
      "choices": [
        {
          "id": "c1_fluid",
          "label": "先打點滴補充水分",
          "emoji": "💧",
          "consequence": {
            "nextBeat": "fluid_bad",
            "outcome": "bad",
            "shortFeedback": "⚠️ 等等，先想一下...",
            "scoreChange": -10
          }
        },
        {
          "id": "c1_exam",
          "label": "先仔細檢查身體，找線索",
          "emoji": "🔍",
          "consequence": {
            "nextBeat": "exam_good",
            "outcome": "good",
            "shortFeedback": "✅ 好主意！",
            "scoreChange": 10
          }
        },
        {
          "id": "c1_echo",
          "label": "用超音波看心臟",
          "emoji": "🫀",
          "consequence": {
            "nextBeat": "echo_good",
            "outcome": "good",
            "shortFeedback": "✅ 很好的判斷！",
            "scoreChange": 15
          }
        }
      ]
    },
    {
      "id": "fluid_bad",
      "type": "reveal",
      "textZh": "你讓護理師快速輸了 500mL 的生理食鹽水。\n\n但幾分鐘後，陳先生開始喘得更厲害了。SpO2 從 94% 掉到 90%。",
      "explanationZh": "💡 **為什麼不能給水？**\n\n陳先生的心臟幫浦功能很差（三天前才心肌梗塞），打太多水進去，心臟打不出去，水會回堵到肺裡，造成「肺水腫」— 就像肺泡被水淹了一樣。",
      "mood": "critical",
      "nextBeat": "recovery_path"
    },
    {
      "id": "exam_good",
      "type": "narration",
      "textZh": "你檢查了他的脖子 — 頸靜脈明顯鼓脹。\n用手摸他的腳 — 冰冷、脈搏微弱。\n聽心音 — 多了一個奇怪的第三心音（S3）。\n\n這些線索都指向同一個方向：**心臟出了問題，不是感染。**",
      "mood": "tense",
      "autoAdvanceMs": 0,
      "nextBeat": "choice_2"
    }
  ],
  "endings": [
    {
      "id": "best",
      "condition": { "minScore": 30 },
      "titleZh": "🌟 值班英雄",
      "descriptionZh": "你快速判斷出 cardiogenic shock，給了正確的藥物，病人穩定了。天亮時，主治醫師對你說：「昨晚處理得很好。」",
      "emoji": "🌟",
      "shareText": "我在 ICU Simulator 裡成功救了一位心因性休克的病人！🫀 你也來試試？",
      "rating": 5
    },
    {
      "id": "okay",
      "condition": { "minScore": 10 },
      "titleZh": "📚 學到了一課",
      "descriptionZh": "雖然中間走了一些彎路，但最終病人還是穩定了。這個值班夜讓你學到：不是所有低血壓都是缺水。",
      "emoji": "📚",
      "shareText": "ICU 值班原來這麼刺激...我在模擬器裡學到了重要的一課 🏥",
      "rating": 3
    },
    {
      "id": "bad",
      "condition": {},
      "titleZh": "😰 驚險一夜",
      "descriptionZh": "病人的狀況一度很危險，還好最後學長趕到幫忙處理。有些教訓要用驚嚇來學，但希望下次你能更快反應。",
      "emoji": "😰",
      "shareText": "ICU 值班模擬器嚇死我了 😱 原來心因性休克不能打點滴...",
      "rating": 1
    }
  ],
  "debrief": {
    "whatHappenedZh": "陳先生是三天前心肌梗塞術後的病人。他的心臟受損嚴重，幫浦功能只剩正常的 20%。當心臟打不出足夠的血，全身器官就會缺氧 — 這就是「心因性休克」。",
    "keyTakeaways": [
      {
        "pointZh": "不是所有低血壓都要打點滴。心臟衰竭的病人給太多水會淹肺。",
        "icon": "💧"
      },
      {
        "pointZh": "手腳冰冷 + 脖子靜脈鼓脹 = 心臟幫浦問題，不是感染。",
        "icon": "🧊"
      },
      {
        "pointZh": "床邊超音波 10 秒就能看到心臟動得好不好，是最快的診斷工具。",
        "icon": "🫀"
      }
    ],
    "realWorldNoteZh": "在真實 ICU 裡，心因性休克的死亡率高達 40-50%。快速正確診斷是活下來的關鍵。每年台灣約有 2-3 萬人因急性心肌梗塞住院，其中 5-8% 會發展成心因性休克。",
    "ctaText": "想體驗完整的值班？試試 Standard 模式 →"
  }
}
```

### Can Lite Beats Be Auto-Derived?

**Partially yes, partially no.** Here's what can be automated:

| Element | Auto-derivable? | How |
|---------|-----------------|-----|
| Vitals flash beats | ✅ Yes | From `initial_vitals` + `vital_transitions` |
| Correct/wrong medication choices | ✅ Yes | From `optimal_management.recommended` / `avoid` |
| Medical explanations | 🟡 Partial | From `learning_points`, but needs rewriting for lay audience |
| Narrative text | ❌ No | Must be hand-written for emotional impact |
| Choice framing | ❌ No | Needs editorial judgment on what's interesting |
| Endings / share text | ❌ No | Brand voice, must be authored |

**Recommendation**: Build a scaffolding tool that generates a Lite overlay *template* from Pro data, pre-filling vitals, choices from medications, and explanations. Then hand-edit the narrative. Estimate: 60% auto-generated structure, 40% hand-written storytelling.

---

## 4. Lite Mode — Visual Novel

### UI Design (Mobile-First)

```
┌────────────────────────┐
│  🫀 值班那一晚          │  ← minimal header
│  5 min · Cardiogenic    │
├────────────────────────┤
│                        │
│  ┌──────────────────┐  │
│  │                  │  │  ← Story panel (big text area)
│  │  凌晨三點，      │  │     with mood-based background
│  │  你的手機響了。   │  │     gradient animation
│  │                  │  │
│  │  你是心臟外科的   │  │
│  │  住院醫師...      │  │
│  │                  │  │
│  └──────────────────┘  │
│                        │
│  ┌──────────────────┐  │  ← Vitals flash (when relevant)
│  │ HR 120  BP 78/45 │  │     animated, color-coded
│  │ SpO2 94%  RR 28  │  │
│  └──────────────────┘  │
│                        │
│  ── tap to continue ── │  ← or auto-advance
│                        │
├────────────────────────┤
│ 💧 先打點滴補充水分     │  ← Choice cards
│ 🔍 先仔細檢查，找線索   │     (appear at decision points)
│ 🫀 用超音波看心臟       │
└────────────────────────┘
```

### Key Design Decisions

1. **Scoring: Light touch** — Use a hidden score that determines the ending, but don't show a score counter. The ending reveals how well you did. This keeps it story-focused, not game-focused.

2. **Progress indicator** — Subtle dots at the top showing how far through the story you are. No chapter numbers.

3. **Explanation panels** — After each choice, show a brief medical explanation in a collapsible "💡 為什麼？" card. Don't force-read it.

4. **Mood system** — Background gradient shifts based on `mood`:
   - `calm` → dark blue/purple (night shift)
   - `tense` → amber/dark
   - `critical` → red pulse border
   - `relief` → soft green

5. **Sound** — Optional, off by default. Heart monitor beeps, alarm sounds. Adds immersion but must be opt-in.

6. **Shareable ending card** — Auto-generated OG image with: scenario emoji, rating stars, share text. One-tap share to IG Story.

7. **No login required** — Lite is the funnel. Zero friction.

8. **Length** — Target 5-7 minutes per scenario. 15-25 beats. 3-5 decision points.

---

## 5. Standard Mode — Guided Simulation

### What Changes from Pro

| Feature | Pro | Standard |
|---------|-----|----------|
| ActionBar | 6 open actions | Same 6, but medication is preset list |
| Chat with nurse | Free-text | Removed — replaced by structured choices |
| Nurse behavior | Reports numbers only | Proactive hints + suggestions |
| Vitals display | White/red only | Green/yellow/red color coding |
| Medication ordering | Free-text name + dose | Dropdown from curated list |
| Lab ordering | Individual tests | Preset panels (CBC panel, cardiac panel...) |
| Time speed | 1x real-time | 0.5x (slower clock) |
| Death | Yes, abrupt | No death — patient stabilizes at critical threshold |
| Handoff | Full free-text | Structured template with prompts |
| Scoring | Complex AI evaluation | Simple checkbox rubric |
| POCUS | Same | Same (it's already visual) |
| Physical exam | Same | Same but highlights abnormal findings |

### Nurse Hint System

The nurse is the core innovation of Standard mode. She's a *teaching assistant*, not just a reporter.

**Hint trigger logic** (runs in store middleware):

```typescript
// Pseudocode for hint engine
function checkHints(state: GameState, overlay: StandardOverlay) {
  const now = Date.now();
  const lastActionTime = state.playerActions.at(-1)?.timestamp ?? state.gameStartedAt;
  const idleSeconds = (now - lastActionTime) / 1000;

  for (const trigger of overlay.nurseProfile.hintTriggers) {
    if (trigger.condition.type === 'no_action_for' && idleSeconds >= trigger.condition.seconds) {
      if (!state.nurseHints.find(h => h.triggerId === trigger.id && h.dismissed === false)) {
        emitHint(trigger);
      }
    }
    // ... other condition types
  }
}
```

**Hints appear as**:
- A floating bubble near the nurse avatar
- Gentle pulse animation for `gentle`, red flash for `urgent`
- Player can dismiss or tap to follow the suggestion

### Vitals Color Coding Implementation

```typescript
function getVitalColor(
  vital: keyof VitalSigns,
  value: number,
  ranges: VitalColorRanges
): 'green' | 'yellow' | 'red' {
  const r = ranges[vital];
  if (value >= r.green[0] && value <= r.green[1]) return 'green';
  if (value >= r.yellow[0] && value <= r.yellow[1]) return 'yellow';
  return 'red';
}
```

The VitalSignsPanel component already has `isAbnormal` logic — extend it to accept a `colorMode: 'binary' | 'tricolor'` prop.

### Simplified Handoff

Instead of free-text, Standard provides a structured template:

```
📋 交班報告

病人：[auto-filled]
主要問題：[dropdown: shock types]
你認為的診斷：[text field with autocomplete]
目前處置：[auto-filled from ordered meds]
需要注意：[checkbox list from learning points]
```

---

## 6. Pro Mode — Current (Unchanged)

Pro mode stays exactly as-is. The only change is:
1. It gets loaded via the new `/simulator/pro/[scenarioId]` route
2. The store gains a `difficulty: 'pro'` field
3. Scenario data is loaded from `base.json` (renamed from `scenario.json`)

**Zero breaking changes to existing Pro mode.**

---

## 7. UX Flow & Level Selection

### Landing Page Flow

```
wilsonchao.com/simulator
        │
        ▼
┌──────────────────────────────┐
│     ICU Simulator            │
│     「你能撐過這個值班嗎？」    │
│                              │
│  ┌─────────┐ ┌──────────┐   │
│  │ 🎬 體驗  │ │ 📚 學習   │   │
│  │  Lite    │ │ Standard │   │
│  │ 5 分鐘   │ │ 15 分鐘  │   │
│  │ 互動故事  │ │ 引導模擬  │   │
│  └─────────┘ └──────────┘   │
│                              │
│       ┌──────────┐           │
│       │ 🏥 值班   │           │
│       │   Pro    │           │
│       │ 30 分鐘  │           │
│       │ 完整模擬  │           │
│       └──────────┘           │
│                              │
│  我是：[一般民眾] [醫學生]     │
│        [住院醫師] [主治醫師]   │
│  → 推薦：Standard             │
└──────────────────────────────┘
```

### Key Decisions

1. **Difficulty first, then scenario** — Because each level has different UI, it's cleaner to commit to a mode first. Also, Lite may not have all scenarios available.

2. **Background-based suggestion** — Optional "我是 ___" selector that highlights the recommended level. Not mandatory. Defaults visible.

3. **No mid-game switching** — The experiences are too different. Instead, show "想試試 Standard？" at the end screen. This also drives engagement (play twice = more time on site).

4. **Deep linking** — Each level+scenario combo has a unique URL for sharing:
   - `wilsonchao.com/simulator/lite/cardiogenic-shock-01`
   - Direct IG Story link goes to Lite mode

5. **Scenario cards** — Show available scenarios as cards with:
   - Title, difficulty badge, estimated time
   - Availability per level (some Pro scenarios might not have Lite overlays yet)

---

## 8. Implementation Plan

### Phase 0: Foundation (1 week)

**What**: Routing, store refactor, scenario loading
**Why**: Unblocks everything else

- [ ] Add `difficulty` field to store
- [ ] Create route structure (`/simulator`, `/simulator/[level]/[scenarioId]`)
- [ ] Create `DifficultySelect` landing page
- [ ] Refactor scenario loading to support `base.json` + overlays
- [ ] Rename `scenario.json` → `base.json` (backward compat symlink)
- [ ] Ensure existing Pro mode works unchanged at new route

**Effort**: ~3 days dev

### Phase 1: Standard Mode (2 weeks) ⭐ Build First

**Why Standard first?**
- It shares 80% of Pro's UI — fastest to build
- It's the *teaching tool* — highest long-term value
- It validates the overlay data structure before Lite
- Clerk/PGY audience is Wilson's direct reach (hospital colleagues)

**Week 1:**
- [ ] `StandardOverlay` type + JSON for cardiogenic-shock-01
- [ ] `GuidedActionPanel` with preset medications
- [ ] Vitals color coding (extend `VitalSignsPanel`)
- [ ] Nurse hint engine (store middleware)
- [ ] `NurseHintBubble` component

**Week 2:**
- [ ] Simplified handoff template
- [ ] Scoring rubric display
- [ ] `StandardGameLayout` integration
- [ ] Time multiplier support in game clock
- [ ] Death prevention logic (stabilize at threshold)
- [ ] End screen with score breakdown

**Effort**: ~8-10 days dev

### Phase 2: Lite Mode (2 weeks)

**Week 1:**
- [ ] `LiteOverlay` type + JSON for cardiogenic-shock-01 (hand-write story)
- [ ] `StoryPanel` component with mood system
- [ ] `ChoiceCard` component
- [ ] Beat sequencing engine (state machine)
- [ ] Vitals flash animation

**Week 2:**
- [ ] `ExplanationPanel` (collapsible "為什麼？")
- [ ] Ending screen with shareable card
- [ ] OG image generation for sharing
- [ ] Mobile optimization pass
- [ ] `LiteEndScreen` with CTA to Standard

**Effort**: ~8-10 days dev

### Phase 3: Polish & Scale (ongoing)

- [ ] Scaffolding tool: auto-generate overlay templates from `base.json`
- [ ] Second scenario: write Standard + Lite overlays
- [ ] Analytics: track which level people play, completion rates, choice distributions
- [ ] A/B test Lite CTA → Standard conversion
- [ ] Lite: add sound effects (optional)
- [ ] Standard: refine hint triggers based on playtest data

### Code Sharing Estimate

| Component | Pro | Standard | Lite |
|-----------|-----|----------|------|
| VitalSignsPanel | ✅ shared | ✅ shared (+ color prop) | ✅ simplified version |
| Store (core) | ✅ shared | ✅ shared (+ hints) | 🟡 separate lite slice |
| Scenario loading | ✅ shared | ✅ shared (+ overlay) | ✅ shared (+ overlay) |
| ActionPanel | ❌ Pro only | 🟡 fork (GuidedActionPanel) | ❌ not used |
| ChatArea | ❌ Pro only | ❌ not used | ❌ not used |
| Modals | ❌ Pro only | 🟡 simplified versions | ❌ not used |
| StoryPanel | ❌ | ❌ | ❌ Lite only |

**Overall: ~40% code shared between Pro and Standard. Lite is ~80% new code.**

### Minimum Viable Version

| Level | MVP Definition |
|-------|----------------|
| **Lite** | 1 scenario, 15-20 beats, 3 choice points, 3 endings, mobile layout, share card |
| **Standard** | 1 scenario, nurse hints (idle + wrong-action), preset meds, color vitals, simple scoring |
| **Pro** | Already exists ✅ |

---

## 9. Open Questions

1. **Analytics**: Do we want to track which choices Lite players make? (Useful for content strategy — "80% of people gave fluids first" is a great IG post.)

2. **Lite bilingual**: The overlay has both `text` and `textZh`. Do we need English? Or is TW audience primary and English can wait?

3. **AI in Standard**: Should Standard mode still use Claude for nurse chat, or is the preset hint system sufficient? (Removing AI = simpler, cheaper, more predictable.)

4. **Scenario gating**: Should some scenarios be locked behind completing easier ones? (Gamification vs. freedom.)

5. **User accounts**: Should Standard/Pro track progress across sessions? (Adds complexity but enables spaced repetition on weak areas.)

6. **Lite on IG WebView**: Test if the Lite experience works well inside Instagram's in-app browser. If not, we need to handle that.

---

## Summary

| | Lite | Standard | Pro |
|--|------|----------|-----|
| **Code new** | ~80% | ~40% | 0% |
| **Scenario data** | Hand-written overlay | Semi-auto overlay | Existing |
| **Build effort** | 2 weeks | 2 weeks | Done |
| **Priority** | P1 (brand) | P0 (teaching) | Done |
| **Audience** | IG followers | Hospital colleagues | Wilson + senior residents |

**Build order: Phase 0 → Standard → Lite**

Standard first because it validates the architecture and provides immediate teaching value. Lite second because it needs the story content pipeline figured out, and it's the marketing funnel — it works better when there's a "try Standard" CTA destination.

Total estimated timeline: **5-6 weeks** from start to both modes live with one scenario each.
