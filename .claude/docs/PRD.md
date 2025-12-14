# ICU Simulator - 產品需求文件 (PRD)

> 由 `/concept` 維護

---

## 專案概述

### 專案目標
建立一個 **ICU 模擬病人教學系統**，讓 Junior Resident 和 Clerk 能在安全的環境中練習：
- 面對病人惡化時的臨床推理
- 鑑別診斷（Differential Diagnosis）
- 開立適當的檢驗、檢查與醫囑
- 床邊超音波（POCUS）判讀
- **交班報告技巧（SBAR）**
- **ACLS/MEGACODE 急救處置**

### 核心價值
- **安全學習**：在模擬環境中犯錯，不會傷害真實病人
- **即時回饋**：透過 Debrief 機制與 AI 學長即時 feedback
- **動態模擬**：病人狀態會根據處置改變，處置有後果
- **完整循環**：從評估 → 處置 → 交班 → 回饋的完整學習流程
- **可擴充性**：情境設定檔驅動，方便新增不同 case
- **貼近實務**：使用台灣醫院常見格式，中文介面 + 英文醫學術語

---

## 目標用戶

### 用戶畫像
| 角色 | 特徵 |
|------|------|
| **Clerk（實習醫學生）** | 臨床經驗少，需要基礎引導 |
| **Junior Resident（住院醫師）** | 有基礎知識，需要練習決策與整合 |
| **未來擴充：教師** | 可建立新情境供學員使用 |

### 使用場景
1. **自主學習**：學員利用空檔時間自行練習
2. **教學活動**：搭配 morning meeting 或教學討論
3. **能力評估**：觀察學員的臨床推理過程（未來）

---

## 遊戲流程設計

### 完整學習循環

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Phase 1: 初始評估                                              │
│  ─────────────────                                              │
│  • 護理師 call                                                  │
│  • 收集資訊 (PE, Labs, POCUS)                                   │
│  • 初步處置決策                                                 │
│                                                                 │
│         ↓                                                       │
│                                                                 │
│  Phase 2: 動態觀察期                                            │
│  ─────────────────                                              │
│  • 病人狀態根據處置變化                                         │
│  • 護理師即時回報                                               │
│  • 可追加處置                                                   │
│                                                                 │
│         ↓                                                       │
│    ┌────┴────┐                                                  │
│    ↓         ↓                                                  │
│                                                                 │
│  [穩定]    [惡化]                                               │
│    ↓         ↓                                                  │
│    │    Phase 3B: ACLS/MEGACODE                                 │
│    │    ────────────────────────                                │
│    │    • Rhythm 判讀                                           │
│    │    • CPR / Defibrillation                                  │
│    │    • ACLS 藥物                                             │
│    │    • Team leadership                                       │
│    │         ↓                                                  │
│    │    [ROSC] or [死亡]                                        │
│    │         ↓                                                  │
│    ↓         ↓                                                  │
│                                                                 │
│  Phase 4: 交班報告                                              │
│  ─────────────────                                              │
│  • SBAR 格式引導                                                │
│  • 學員輸入報告內容                                             │
│  • AI 學長即時 comment                                          │
│                                                                 │
│         ↓                                                       │
│                                                                 │
│  Phase 5: 完整 Debrief                                          │
│  ─────────────────                                              │
│  • 診斷正確性                                                   │
│  • 處置時效性                                                   │
│  • 交班品質評估                                                 │
│  • 學習重點                                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 功能需求

### 核心功能 (MVP v1)

#### 1. 情境系統
- [x] 情境設定檔驅動（JSON 格式）
- [x] 首個情境：Cardiogenic shock mimicking septic shock
- [x] 顯示情境背景（護理師 call：「病人怪怪的」）

#### 2. Vital Signs 面板
- [x] 即時顯示：HR, BP, RR, SpO2, Temperature
- [x] Current Status：意識狀態、外觀描述
- [x] 異常值紅色標示

#### 3. 病史詢問（對話式）
- [x] 自然語言輸入
- [x] AI（Claude API）根據情境生成回應
- [x] 對話歷程記錄

#### 4. 理學檢查（選單式）
- [x] 簡化版系統檢查：
  - 整體外觀 (General appearance)
  - 心臟檢查 (Cardiac) → JVP, Heart sound, PMI
  - 肺部檢查 (Pulmonary) → Breath sounds, Percussion
  - 腹部檢查 (Abdominal)
  - 四肢/周邊 (Extremities) → Edema, Pulse, Capillary refill

#### 5. 檢驗開立與報告
- [x] 勾選開立檢驗項目
- [x] 顯示報告結果（台灣醫院格式）
- [x] 異常值標示

**檢驗項目清單：**
| 類別 | 項目 |
|------|------|
| CBC | WBC, Hb, Hct, Platelet |
| Biochemistry | BUN, Creatinine, Na, K, AST, ALT |
| Cardiac markers | Troponin-I, NT-proBNP |
| Infection markers | Procalcitonin, Lactate, CRP |
| ABG | pH, pCO2, pO2, HCO3, BE, SaO2 |
| Coagulation | PT (INR), aPTT, D-dimer |

#### 6. 床邊超音波 (POCUS)
- [x] 選擇 View → 顯示圖片/影片
- [x] MVP Views：
  - Parasternal long axis (PLAX)
  - Parasternal short axis (PSAX)
  - Apical 4 chamber (A4C)
  - Subcostal view
  - IVC assessment
  - Lung ultrasound

#### 7. 醫囑開立
- [x] 選擇藥物類別 → 具體藥物 → 劑量 → 頻次
- [x] 劑量合理性驗證（警告不合理劑量）
- [x] 醫囑清單顯示

**MVP 藥物類別：**
| 類別 | 藥物 |
|------|------|
| Vasopressors | Norepinephrine, Dopamine, Vasopressin, Epinephrine |
| Inotropes | Dobutamine, Milrinone |
| Fluids | 0.9% N/S, Lactated Ringer's, 5% Albumin |
| Diuretics | Furosemide (Lasix) |
| Antibiotics | Ceftriaxone, Piperacillin/Tazobactam, Vancomycin |
| Steroids | Hydrocortisone |
| Others | Morphine, Fentanyl |

#### 8. Debrief 機制
- [x] 「提交診斷」按鈕觸發
- [x] 顯示正確診斷
- [x] 列出 Key findings 學員是否有發現
- [x] 指出錯誤處置
- [x] 顯示最佳路徑對照

---

### 進階功能 (MVP v2) 🆕

#### 9. 動態病人狀態系統
- [ ] **處置後果機制**：開立處置後，vitals 會根據正確性改變
- [ ] **時間流逝效應**：不處置時，病人狀態會逐漸惡化
- [ ] **護理師即時回報**：狀態改變時主動跳訊息
- [ ] **惡化閾值**：到達臨界值觸發 ACLS

**處置效果範例：**
| 處置 | 情境 | 效果 |
|------|------|------|
| NS 1L bolus | Cardiogenic shock | SpO2 ↓6%, RR ↑8, 護理師警告 |
| Norepinephrine | Cardiogenic shock | BP ↑15/10, 穩定 |
| Dobutamine | Cardiogenic shock | HR ↑10, BP ↑10, 改善 |

**惡化閾值 → 觸發 ACLS：**
| 指標 | 臨界值 |
|------|--------|
| HR | < 40 或 > 150 |
| BP systolic | < 60 |
| SpO2 | < 75% |
| 意識 | Unresponsive |

#### 10. ACLS / MEGACODE 模式
- [ ] **觸發機制**：病人惡化到臨界值時自動進入
- [ ] **心律判讀**：顯示 ECG 波形，選擇正確心律
- [ ] **處置選擇**：
  - CPR 啟動
  - Defibrillation（電擊）
  - ACLS 藥物給予
- [ ] **時間壓力**：2 分鐘循環計時
- [ ] **結果判定**：ROSC 成功 / 死亡

**ACLS 心律選項：**
- Ventricular Fibrillation (VF)
- Pulseless Ventricular Tachycardia (pVT)
- Asystole
- Pulseless Electrical Activity (PEA)

**ACLS 藥物選項：**
| 藥物 | 劑量 | 適應症 |
|------|------|--------|
| Epinephrine | 1mg IV q3-5min | All rhythms |
| Amiodarone | 300mg first, 150mg second | VF/pVT |
| Lidocaine | 1-1.5 mg/kg | VF/pVT alternative |
| Atropine | 1mg IV | Bradycardia |

#### 11. 交班報告系統
- [ ] **SBAR 格式引導**：
  - **S**ituation: 目前狀況
  - **B**ackground: 相關病史
  - **A**ssessment: 你的判斷
  - **R**ecommendation: 建議處置
- [ ] **自由輸入**：學員填寫各欄位
- [ ] **AI 學長評估**：Claude API 分析報告品質
- [ ] **即時回饋**：
  - 優點指出
  - 遺漏項目提醒
  - 錯誤判斷糾正
  - 臨床小提醒

**學長評估維度：**
| 維度 | 說明 |
|------|------|
| 完整性 | SBAR 各項是否完整 |
| 準確性 | 資訊是否正確 |
| 關鍵資訊 | 是否提到重要發現 |
| 臨床判斷 | Assessment 是否合理 |
| 建議適當性 | Recommendation 是否適當 |

#### 12. 計分系統
- [ ] **處置分數**：
  - 正確診斷: +50 分
  - 每個 key finding 發現: +10 分
  - 適當處置: +15 分
  - 錯誤處置: -20 分
  - 時間 bonus（5 分鐘內穩定）: +20 分
- [ ] **ACLS 分數**：
  - 正確判讀心律: +10 分
  - 正確電擊決策: +15 分
  - 正確藥物選擇: +10 分
  - ROSC 成功: +30 分
- [ ] **交班分數**：
  - SBAR 完整度: +5~20 分
  - 關鍵資訊涵蓋: +10 分
  - 學長評價: +0~20 分

---

### 次要功能（未來版本）

- [ ] 多情境支援與情境選擇介面
- [ ] 操作歷程記錄與回放
- [ ] 帳號系統與學習紀錄
- [ ] 成就系統 / 徽章
- [ ] 排行榜
- [ ] 情境編輯器（讓教師自建情境）
- [ ] 多人協作模式
- [ ] 手機 App 版本

---

## 非功能需求

### 效能要求
- 頁面載入時間 < 3 秒
- AI 對話回應 < 5 秒
- Vitals 更新延遲 < 500ms

### 安全要求
- Claude API Key 不暴露於前端
- 未來加入帳號系統時需 HTTPS

### 相容性
- 主要支援：Chrome, Firefox, Safari, Edge（最新兩版本）
- 響應式設計：支援桌機、平板
- 手機：可用但非最佳化

---

## UI/UX 設計

### 主畫面 Layout（v1）

```
┌──────────────────────────────────────────────────────────────────┐
│  ICU Simulator                        [情境名稱]    [重新開始]   │
├──────────────────┬───────────────────────────────────────────────┤
│                  │                                               │
│  ┌────────────┐  │  💬 對話區 / 結果顯示區                        │
│  │ Vital Signs│  │  ──────────────────────────────────────────   │
│  │            │  │  🏥 護理師：「病人看起來怪怪的，血壓偏低...」  │
│  │ HR: 120    │  │                                               │
│  │ BP: 78/45  │  │  👨‍⚕️ 你：「請問病人有發燒嗎？」                │
│  │ RR: 28     │  │                                               │
│  │ SpO2: 94%  │  │  🏥 護理師：「體溫 37.2，沒有明顯發燒...」    │
│  │ Temp: 37.2 │  │                                               │
│  └────────────┘  │  [檢驗報告]  [POCUS 影像]  [PE 結果]          │
│                  │                                               │
│  ┌────────────┐  ├───────────────────────────────────────────────┤
│  │ Status     │  │  🎬 動作面板                                   │
│  │ ────────── │  │                                               │
│  │ 意識:      │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│  │ Alert,     │  │  │ 病史 │ │ 理學 │ │ 檢驗 │ │ POCUS│         │
│  │ anxious    │  │  │ 詢問 │ │ 檢查 │ │ 開立 │ │      │         │
│  │            │  │  └──────┘ └──────┘ └──────┘ └──────┘         │
│  │ 外觀:      │  │  ┌──────┐ ┌──────┐                            │
│  │ 蒼白、冒汗 │  │  │ 報告 │ │ 醫囑 │      [ 交班報告 ]          │
│  │            │  │  │ 結果 │ │ 開立 │                            │
│  └────────────┘  │  └──────┘ └──────┘                            │
│                  │                                               │
│  ⏱️ 經過: 3:42   │                         [ 提交診斷 ]          │
│  📊 分數: 45     │                                               │
└──────────────────┴───────────────────────────────────────────────┘
```

### ACLS 模式 Layout（v2）

```
┌─────────────────────────────────────────────────────────────────┐
│  🚨 CODE BLUE - 15 床          ⏱️ 00:45    Cycle: 1             │
├───────────────────────────────────────┬─────────────────────────┤
│                                       │                         │
│  📊 Monitor                           │  📋 你的指令            │
│  ┌─────────────────────────────┐     │                         │
│  │     ~~~VF waveform~~~       │     │  ✓ "開始 CPR"           │
│  │     ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿       │     │  → "分析心律"           │
│  └─────────────────────────────┘     │                         │
│                                       │                         │
│  HR: ---  BP: ---/---                │                         │
│  SpO2: ---                           │                         │
│                                       │                         │
├───────────────────────────────────────┴─────────────────────────┤
│                                                                 │
│  這是什麼心律？                                                 │
│                                                                 │
│  ○ Ventricular Fibrillation (VF)                               │
│  ○ Pulseless Ventricular Tachycardia (pVT)                     │
│  ○ Asystole                                                    │
│  ○ Pulseless Electrical Activity (PEA)                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [⚡ 電擊]  [💉 給藥]  [🔄 繼續 CPR]  [🔍 檢查脈搏]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 交班報告 Layout（v2）

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 交班報告給學長                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  S - Situation (目前狀況)                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  B - Background (背景)                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  A - Assessment (評估)                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  R - Recommendation (建議)                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                        [提交報告給學長]         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 情境資料結構

### scenario.json 結構（v2 擴充）

```json
{
  "id": "cardiogenic-shock-01",
  "title": "Cardiogenic Shock Mimicking Sepsis",
  "difficulty": "intermediate",
  "author": "作者名稱",
  "version": "2.0",

  "opening": { ... },
  "patient": { ... },
  "initial_vitals": { ... },
  "current_status": { ... },
  "history_context": { ... },
  "physical_exam": { ... },
  "lab_results": { ... },
  "pocus_findings": { ... },
  "diagnosis": { ... },
  "optimal_management": { ... },
  "learning_points": [ ... ],

  // 🆕 v2 新增
  "vital_transitions": [
    {
      "trigger": { "medication": "NS", "volume_gt": 1000 },
      "delay_seconds": 30,
      "effect": {
        "spo2_delta": -6,
        "rr_delta": 8,
        "bp_systolic_delta": -10
      },
      "nurse_message": "醫師！病人喘得更厲害了，SpO2 掉下來了！"
    },
    {
      "trigger": { "medication": "norepinephrine" },
      "delay_seconds": 60,
      "effect": {
        "bp_systolic_delta": 15,
        "bp_diastolic_delta": 10
      },
      "nurse_message": "血壓有慢慢上來了"
    }
  ],

  "deterioration_thresholds": {
    "trigger_acls": {
      "hr_lt": 40,
      "hr_gt": 150,
      "bp_systolic_lt": 60,
      "spo2_lt": 75
    }
  },

  "acls_scenario": {
    "initial_rhythm": "vf",
    "rhythm_sequence": ["vf", "vf", "rosc"],
    "correct_treatment": ["shock", "epi", "amio", "shock"]
  },

  "handoff_evaluation": {
    "required_mentions": [
      "STEMI 病史",
      "PCI 三天前",
      "低血壓",
      "JVP elevated",
      "Echo EF 20%",
      "Cardiogenic shock"
    ],
    "critical_errors": [
      "誤診為 septic shock",
      "建議大量輸液"
    ]
  }
}
```

---

## Subagent 設計

| Subagent | 職責 | 建立狀態 |
|----------|------|----------|
| `/concept` | 概念設計、PRD/TECHSTACK 維護 | ✅ 已建立 |
| `/pm` | 實作計畫、任務分配、進度追蹤 | ✅ 已建立 |
| `/coder` | 全端開發（UI + API） | ✅ 已建立 |
| `/scenario` | 情境資料建立與維護 | 待建立 |

---

## 變更記錄

| 日期 | 版本 | 變更內容 |
|------|------|----------|
| 2025-12-14 | v0.1 | 初版建立，完成核心概念定義 |
| 2025-12-14 | v0.2 | 🆕 加入動態病人、ACLS/MEGACODE、交班報告、計分系統 |
