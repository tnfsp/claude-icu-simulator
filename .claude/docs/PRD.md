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

### 核心價值
- **安全學習**：在模擬環境中犯錯，不會傷害真實病人
- **即時回饋**：透過 Debrief 機制了解最佳處置路徑
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

## 功能需求

### 核心功能 (MVP)

#### 1. 情境系統
- [x] 情境設定檔驅動（JSON 格式）
- [x] 首個情境：Cardiogenic shock mimicking septic shock
- [x] 顯示情境背景（護理師 call：「病人怪怪的」）

#### 2. Vital Signs 面板
- [x] 即時顯示：HR, BP, RR, SpO2, Temperature
- [x] Current Status：意識狀態、外觀描述
- [ ] 動態更新：根據時間/處置改變（架構預留，MVP 後實作）

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
| Biochemistry | BUN, Creatinine, Na, K, AST, ALT, Total bilirubin |
| Cardiac markers | Troponin-I, NT-proBNP |
| Infection markers | Procalcitonin, Lactate, CRP |
| ABG | pH, pCO2, pO2, HCO3, BE, SaO2 |
| Coagulation | PT (INR), aPTT, D-dimer |
| Others | Blood culture (結果延遲), Urinalysis |

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

### 次要功能（MVP 後）
- [ ] Vital signs 動態變化（根據時間/處置）
- [ ] 操作歷程記錄與回放
- [ ] 多情境支援與情境選擇介面
- [ ] 計分/評量機制
- [ ] 帳號系統與學習紀錄

### 未來考慮
- 情境編輯器（讓教師自建情境）
- 多人協作模式
- 手機 App 版本
- 與醫院教學系統整合

---

## 非功能需求

### 效能要求
- 頁面載入時間 < 3 秒
- AI 對話回應 < 5 秒

### 安全要求
- Claude API Key 不暴露於前端
- 未來加入帳號系統時需 HTTPS

### 相容性
- 主要支援：Chrome, Firefox, Safari, Edge（最新兩版本）
- 響應式設計：支援桌機、平板
- 手機：可用但非最佳化

---

## UI/UX 設計

### 主畫面 Layout

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
│  │ 蒼白、冒汗 │  │  │ 影像 │ │ 醫囑 │      [ 提交診斷 ]          │
│  │            │  │  │ 檢查 │ │ 開立 │                            │
│  └────────────┘  │  └──────┘ └──────┘                            │
│                  │                                               │
└──────────────────┴───────────────────────────────────────────────┘
```

### 互動流程

```
[情境開始]
    │
    ▼
護理師 call 說明情況
    │
    ▼
┌─────────────────────────────────────┐
│  學員自由操作：                      │
│  • 對話詢問病史                      │
│  • 點選理學檢查                      │
│  • 開立檢驗                          │
│  • 執行 POCUS                        │
│  • 開立醫囑                          │
└─────────────────────────────────────┘
    │
    ▼
[提交診斷] ──→ Debrief 畫面
                 │
                 ├─ 正確診斷
                 ├─ Key findings 檢核
                 ├─ 錯誤處置指出
                 └─ 最佳路徑說明
```

---

## 情境資料結構

```
scenarios/
├── cardiogenic-shock-01/
│   ├── scenario.json       # 情境設定主檔
│   ├── assets/
│   │   ├── echo-plax.mp4
│   │   ├── echo-a4c.mp4
│   │   ├── echo-ivc.mp4
│   │   ├── lung-us.jpg
│   │   └── cxr.jpg
│   └── README.md           # 情境說明（教案）
```

### scenario.json 結構

```json
{
  "id": "cardiogenic-shock-01",
  "title": "Cardiogenic Shock Mimicking Sepsis",
  "difficulty": "intermediate",
  "author": "作者名稱",
  "version": "1.0",

  "opening": {
    "caller": "護理師",
    "message": "醫師，床號 15 的病人看起來怪怪的，血壓有點低，你要不要來看一下？"
  },

  "patient": {
    "age": 68,
    "gender": "M",
    "bed": "15",
    "brief_history": "HTN, DM, 三天前 STEMI s/p primary PCI to LAD"
  },

  "initial_vitals": {
    "hr": 120,
    "bp_systolic": 78,
    "bp_diastolic": 45,
    "rr": 28,
    "spo2": 94,
    "temperature": 37.2
  },

  "current_status": {
    "consciousness": "Alert but anxious",
    "appearance": "蒼白、冒汗、四肢冰冷"
  },

  "history_context": {
    "description": "病人三天前因 STEMI 接受 PCI，今天早上開始覺得喘...",
    "key_points": [
      "沒有發燒",
      "沒有咳嗽、痰",
      "尿量減少",
      "從昨晚開始覺得喘，今天更喘"
    ]
  },

  "physical_exam": {
    "general": "看起來不舒服，端坐呼吸",
    "cardiac": {
      "jvp": "Elevated, ~12 cmH2O",
      "heart_sound": "S3 gallop present, no murmur",
      "pmi": "Displaced laterally"
    },
    "pulmonary": {
      "breath_sounds": "Bilateral basilar crackles",
      "percussion": "Dull at bases"
    },
    "abdomen": "Soft, mild RUQ tenderness, liver palpable",
    "extremities": {
      "edema": "2+ bilateral pedal edema",
      "pulse": "Weak, thready",
      "capillary_refill": "> 3 seconds",
      "temperature": "Cold"
    }
  },

  "lab_results": {
    "cbc": { "wbc": 9.8, "hb": 12.1, "hct": 36.3, "platelet": 178 },
    "biochemistry": { "bun": 45, "cr": 1.8, "na": 134, "k": 4.8, "ast": 56, "alt": 42 },
    "cardiac": { "troponin_i": 2.4, "nt_probnp": 8500 },
    "infection": { "procalcitonin": 0.3, "lactate": 4.2, "crp": 2.1 },
    "abg": { "ph": 7.32, "pco2": 32, "po2": 68, "hco3": 18, "be": -6, "sao2": 92 },
    "coagulation": { "pt_inr": 1.2, "aptt": 34, "d_dimer": 1.8 }
  },

  "pocus_findings": {
    "plax": { "video": "echo-plax.mp4", "finding": "Severely reduced LV function, EF ~20%" },
    "a4c": { "video": "echo-a4c.mp4", "finding": "Dilated LV, global hypokinesis" },
    "ivc": { "video": "echo-ivc.mp4", "finding": "Dilated IVC > 2.1cm, < 50% collapse" },
    "lung": { "image": "lung-us.jpg", "finding": "Multiple B-lines bilaterally" }
  },

  "diagnosis": {
    "primary": "Cardiogenic shock",
    "differential": ["Septic shock", "Hypovolemic shock"],
    "key_differentiators": [
      "Elevated JVP (不像 septic shock)",
      "Cold extremities (septic shock 通常 warm)",
      "Low procalcitonin",
      "Poor LV function on echo",
      "Dilated non-collapsing IVC"
    ]
  },

  "optimal_management": {
    "avoid": [
      { "action": "大量輸液", "reason": "會加重肺水腫" }
    ],
    "recommended": [
      { "action": "Norepinephrine", "detail": "0.05-0.1 mcg/kg/min 起始" },
      { "action": "Dobutamine", "detail": "2.5-5 mcg/kg/min，改善 cardiac output" },
      { "action": "Furosemide", "detail": "若有明顯 congestion" },
      { "action": "考慮照會心臟科", "detail": "評估是否需 IABP 或其他 MCS" }
    ]
  },

  "learning_points": [
    "Cardiogenic shock 可能因低灌流而有 elevated lactate，容易誤認為 sepsis",
    "Physical exam 的 JVP 和四肢溫度是重要鑑別點",
    "Bedside echo 可快速區分 cardiogenic vs distributive shock",
    "對 cardiogenic shock 給大量輸液會惡化病情"
  ]
}
```

---

## Subagent 設計

| Subagent | 職責 | 建立狀態 |
|----------|------|----------|
| `/concept` | 概念設計、PRD/TECHSTACK 維護 | ✅ 已建立 |
| `/pm` | 實作計畫、任務分配、進度追蹤 | ✅ 已建立 |
| `/frontend` | 前端 UI 開發 | 待建立 |
| `/backend` | API 與 AI 整合開發 | 待建立 |
| `/scenario` | 情境資料建立與維護 | 待建立 |

---

## 變更記錄

| 日期 | 版本 | 變更內容 |
|------|------|----------|
| 2024-12-14 | v0.1 | 初版建立，完成核心概念定義 |
