import type { StandardOverlay } from "./types";

/**
 * Standard mode overlay for cardiogenic-shock-01 scenario.
 * Provides nurse hints, preset medications, vital color ranges,
 * preset order bundles, and scoring rubric.
 */
export const cardiogenicShockStandardOverlay: StandardOverlay = {
  scenarioId: "cardiogenic-shock-01",

  nurseHintTriggers: [
    {
      id: "hint-game-start",
      condition: { type: "game_start" },
      delaySeconds: 10,
      hint: "醫師，病人血壓蠻低的，你覺得是什麼原因？要不要先做個理學檢查？",
      priority: "gentle",
    },
    {
      id: "hint-idle-45s",
      condition: { type: "no_action_for", seconds: 45 },
      delaySeconds: 0,
      hint: "醫師，病人看起來不太好耶...要不要先看一下 vital signs 有什麼線索？",
      priority: "gentle",
    },
    {
      id: "hint-no-pocus",
      condition: { type: "no_pocus_after", seconds: 120 },
      delaySeconds: 0,
      hint: "醫師，我們有床邊超音波，要不要照一下看看心臟功能？可能會有幫助。",
      priority: "gentle",
    },
    {
      id: "hint-wrong-fluid",
      condition: { type: "wrong_action", action: "fluid_bolus" },
      delaySeconds: 5,
      hint: "醫師，我剛打了輸液進去，可是病人好像更喘了...要不要重新想一下？這個病人的 JVP 本來就很高耶...",
      priority: "urgent",
    },
    {
      id: "hint-critical-bp",
      condition: { type: "vitals_critical", vital: "bp_systolic" },
      delaySeconds: 0,
      hint: "醫師！血壓掉到很低了，需要趕快處理！要不要考慮升壓藥？",
      priority: "urgent",
    },
    {
      id: "hint-critical-spo2",
      condition: { type: "vitals_critical", vital: "spo2" },
      delaySeconds: 0,
      hint: "醫師！SpO2 掉得很低，病人可能需要更積極的處置！",
      priority: "urgent",
    },
    {
      id: "sepsis_panel_ordered",
      condition: { type: "wrong_action", action: "sepsis_panel" },
      delaySeconds: 0,
      hint: "PCT 才 0.3，看起來不太像 sepsis 耶⋯先處理心臟的問題？",
      priority: "gentle" as const,
    },
    {
      id: "hint-missed-pe",
      condition: { type: "missed_action", action: "physical_exam", bySeconds: 90 },
      delaySeconds: 0,
      hint: "醫師，你有注意到病人的脖子嗎？看起來頸靜脈蠻明顯的...理學檢查可能會給你一些線索。",
      priority: "gentle",
    },
  ],

  medicationPresets: [
    {
      id: "ns_500",
      name: "Normal Saline 500mL",
      category: "harmful",
      display: "生理食鹽水 500 mL 快速輸注",
      explanation: "⚠️ 這個病人是 cardiogenic shock，已經 volume overload 了。給輸液會讓肺水腫更嚴重！",
      triggersTransition: "NS",
    },
    {
      id: "norepi",
      name: "Norepinephrine",
      category: "correct",
      display: "Norepinephrine 0.05 mcg/kg/min",
      explanation: "✅ 正確！Norepinephrine 可以維持血壓，而且對心臟的 afterload 影響相對可接受。",
      triggersTransition: "norepinephrine",
    },
    {
      id: "dobutamine",
      name: "Dobutamine",
      category: "correct",
      display: "Dobutamine 5 mcg/kg/min",
      explanation: "✅ 正確！Dobutamine 是 inotrope，可以增加 cardiac output，正是這個病人需要的。",
      triggersTransition: "dobutamine",
    },
    {
      id: "furosemide",
      name: "Furosemide",
      category: "correct",
      display: "Furosemide 40 mg IV",
      explanation: "✅ 好選擇！病人有 pulmonary congestion，利尿可以改善呼吸。",
      triggersTransition: "furosemide",
    },
    {
      id: "dopamine",
      name: "Dopamine",
      category: "neutral",
      display: "Dopamine 10 mcg/kg/min",
      explanation: "⚠️ 可以用，但 Dopamine 比 Norepinephrine 更容易造成心律不整。目前 guidelines 較不推薦作為第一線。",
    },
    {
      id: "broad_abx",
      name: "Broad-spectrum Antibiotics",
      category: "neutral",
      display: "Tazocin 4.5g IV",
      explanation: "⚠️ 如果真的是 sepsis 的話會需要，但目前 procalcitonin 很低 (0.3)，而且 echo 顯示嚴重心衰。先確認診斷比較重要。",
    },
  ],

  vitalRanges: {
    // HR: No yellow zone for bradycardia — in cardiogenic shock,
    // HR < 60 is a late ominous sign that warrants immediate red alert.
    // Yellow only covers mild tachycardia (100-120).
    hr: { green: [60, 100], yellow: [100, 120], red: [120, 999] },
    bp_systolic: { green: [90, 140], yellow: [70, 90], red: [0, 70] },
    rr: { green: [12, 20], yellow: [20, 28], red: [28, 999] },
    spo2: { green: [95, 100], yellow: [90, 95], red: [0, 90] },
    temperature: { green: [36.0, 37.5], yellow: [37.5, 38.5], red: [38.5, 999] },
  },

  presetOrderBundles: [
    {
      id: "cardiac-panel",
      label: "🫀 Cardiac Panel",
      description: "Troponin, NT-proBNP, CK-MB",
      items: ["cardiac"],
    },
    {
      id: "sepsis-panel",
      label: "🦠 Sepsis Panel",
      description: "CBC, CRP, Procalcitonin, Lactate, Blood culture",
      items: ["cbc", "infection"],
    },
    {
      id: "basic-panel",
      label: "📊 Basic Panel",
      description: "CBC, BMP, Coagulation",
      items: ["cbc", "biochemistry", "coagulation"],
    },
    {
      id: "abg-panel",
      label: "🫁 ABG",
      description: "Arterial Blood Gas",
      items: ["abg"],
    },
  ],

  scoring: {
    keyActions: [
      {
        id: "pe_cardiac",
        action: "physical_exam_cardiac",
        points: 10,
        required: true,
        description: "心臟理學檢查（聽心音、看 JVP）",
      },
      {
        id: "pe_extremities",
        action: "physical_exam_extremities",
        points: 10,
        required: true,
        description: "四肢檢查（溫度、脈搏、CRT）",
      },
      {
        id: "pocus_heart",
        action: "pocus_cardiac",
        points: 15,
        required: true,
        description: "心臟超音波（A4C / PLAX）",
      },
      {
        id: "pocus_ivc",
        action: "pocus_ivc",
        points: 10,
        required: false,
        description: "IVC 超音波",
      },
      {
        id: "order_vasopressor",
        action: "order_norepinephrine",
        points: 15,
        required: true,
        description: "使用升壓藥（Norepinephrine）",
      },
      {
        id: "order_inotrope",
        action: "order_dobutamine",
        points: 15,
        required: true,
        description: "使用強心藥（Dobutamine）",
      },
      {
        id: "order_diuretic",
        action: "order_furosemide",
        points: 10,
        required: false,
        description: "使用利尿劑（Furosemide）",
      },
      {
        id: "avoid_fluid",
        action: "avoid_fluid_bolus",
        points: 15,
        required: true,
        description: "避免大量輸液",
      },
    ],
    maxScore: 100,
  },
};

export function getStandardOverlay(scenarioId: string): StandardOverlay | null {
  if (scenarioId === "cardiogenic-shock-01") {
    return cardiogenicShockStandardOverlay;
  }
  return null;
}
