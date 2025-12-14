# ICU Simulator - 實作計畫

> 由 `/pm` 維護

---

## 專案資訊

- **專案名稱**: ICU Simulator
- **PRD 版本**: v0.2
- **計畫建立日期**: 2025-12-14
- **最後更新**: 2025-12-14

---

## 版本規劃

### MVP v1（基礎版）- Phase 1~7
> 靜態病人、基本互動、Debrief

### MVP v2（進階版）- Phase 8~11
> 動態病人、ACLS、交班報告、計分系統

---

## 階段規劃

### Phase 1: 專案初始化 ✅
> 環境設定、基礎架構

- [x] **1.1** 初始化 Next.js 專案（App Router）
- [x] **1.2** 安裝與設定 Tailwind CSS
- [x] **1.3** 安裝與設定 shadcn/ui
- [x] **1.4** 安裝 Zustand 狀態管理
- [x] **1.5** 建立專案目錄結構
- [x] **1.6** 設定 TypeScript 類型定義（`lib/types.ts`）
- [x] **1.7** 設定環境變數（`.env.local`）

### Phase 2: 核心 UI 開發 ✅
> 前端介面與元件

- [x] **2.1** 建立主頁面 Layout（左側面板 + 右側互動區）
- [x] **2.2** VitalSignsPanel 元件（HR, BP, RR, SpO2, Temp）
- [x] **2.3** StatusPanel 元件（意識狀態、外觀）
- [x] **2.4** ChatArea 元件（對話歷程顯示）
- [x] **2.5** ActionPanel 元件（6 個動作按鈕）
- [x] **2.6** 建立 Zustand store（遊戲狀態管理）

### Phase 3: 互動功能 - 基礎 ✅
> 選單式互動功能

- [x] **3.1** PhysicalExamModal（理學檢查選單 + 結果顯示）
- [x] **3.2** LabOrderModal（檢驗開立勾選）
- [x] **3.3** LabResultsModal（檢驗報告顯示，台灣格式）
- [x] **3.4** POCUSModal（選擇 view + 顯示圖片/影片）
- [x] **3.5** OrdersModal（醫囑開立：藥物 + 劑量 + 頻次）
- [x] **3.6** 醫囑劑量驗證邏輯（`lib/validators.ts`）

### Phase 4: 互動功能 - AI 對話
> Claude API 整合

- [ ] **4.1** 建立 `/api/chat` API Route
- [ ] **4.2** Claude API 封裝（`lib/claude.ts`）
- [ ] **4.3** 對話輸入元件整合
- [ ] **4.4** Streaming 回應實作
- [ ] **4.5** 對話歷程 context 管理

### Phase 5: 情境系統
> 情境載入與 Debrief

- [ ] **5.1** 建立首個情境 JSON（Cardiogenic shock）
- [ ] **5.2** 建立 `/api/scenario` API Route
- [ ] **5.3** 情境載入與初始化邏輯
- [x] **5.4** DiagnosisModal（提交診斷選擇）
- [x] **5.5** DebriefModal（結果分析、最佳路徑）
- [ ] **5.6** 操作追蹤（記錄學員做了什麼）

### Phase 6: 整合與測試
> 完整流程測試

- [ ] **6.1** 完整流程走通測試
- [ ] **6.2** UI/UX 調整與優化
- [ ] **6.3** 響應式設計調整（平板支援）
- [ ] **6.4** 錯誤處理與 loading 狀態

### Phase 7: 部署 v1
> Vercel 部署上線

- [ ] **7.1** 環境變數設定（Vercel）
- [ ] **7.2** 部署測試
- [ ] **7.3** 域名設定（如需要）

---

## MVP v2 新增階段 🆕

### Phase 8: 動態病人狀態系統
> 處置有後果，病人會變化

- [ ] **8.1** 擴充 TypeScript 類型定義（VitalTransition, DeteriorationThresholds）
- [ ] **8.2** VitalEngine 核心邏輯（`lib/vital-engine.ts`）
  - 處置效果計算
  - 時間流逝效應
  - 惡化閾值檢測
- [ ] **8.3** 護理師即時回報系統
  - 自動訊息觸發
  - 警告訊息顯示
- [ ] **8.4** VitalSignsPanel 動態更新
  - 動畫效果（數值變化）
  - 警告狀態（閃爍、顏色）
- [ ] **8.5** 經過時間顯示（Timer）
- [ ] **8.6** 情境 JSON 擴充（vital_transitions）

### Phase 9: ACLS / MEGACODE 模式
> 急救訓練系統

- [ ] **9.1** ACLS 類型定義（Rhythm, ACLSAction, ACLSState）
- [ ] **9.2** ACLS 觸發機制（從 VitalEngine 觸發）
- [ ] **9.3** ACLSMode 主元件
  - 全螢幕模式切換
  - 計時器（2 分鐘循環）
- [ ] **9.4** RhythmDisplay 元件
  - ECG 波形顯示（SVG/Canvas）
  - VF, pVT, Asystole, PEA 波形
- [ ] **9.5** 心律判讀選擇介面
- [ ] **9.6** ACLS 動作按鈕
  - 電擊（Defibrillation）
  - 給藥（藥物選單）
  - 繼續 CPR
  - 檢查脈搏
- [ ] **9.7** ACLS 藥物選單（Epinephrine, Amiodarone, etc.）
- [ ] **9.8** ACLS 結果判定邏輯（ROSC / 死亡）
- [ ] **9.9** 情境 JSON 擴充（acls_scenario）

### Phase 10: 交班報告系統
> SBAR 格式 + AI 學長評估

- [ ] **10.1** HandoffModal 元件
  - SBAR 四欄位輸入
  - 字數提示
  - 提交按鈕
- [ ] **10.2** 建立 `/api/evaluate-handoff` API Route
- [ ] **10.3** 學長 AI Prompt 設計
  - 角色設定（ICU 學長）
  - 評估維度定義
  - 回饋格式規範
- [ ] **10.4** HandoffFeedback 元件
  - 優點/遺漏/錯誤分類顯示
  - 臨床小提醒
- [ ] **10.5** 情境 JSON 擴充（handoff_evaluation）
- [ ] **10.6** 整合至遊戲流程（穩定/ROSC 後觸發）

### Phase 11: 計分系統與完整 Debrief
> 分數計算與綜合回饋

- [ ] **11.1** 計分邏輯實作（`lib/scoring.ts`）
  - 處置分數
  - ACLS 分數
  - 交班分數
  - 時間 bonus
- [ ] **11.2** ScoreDisplay 元件（即時分數顯示）
- [ ] **11.3** 擴充 DebriefModal
  - 總分與各項細分
  - 時間線回顧
  - 交班評估結果
  - ACLS 表現（如有）
- [ ] **11.4** 結果分享功能（截圖/連結）

---

## 進度追蹤

| 階段 | 狀態 | 完成度 | 任務數 |
|------|------|--------|--------|
| Phase 1 | ✅ 完成 | 100% | 7 項 |
| Phase 2 | ✅ 完成 | 100% | 6 項 |
| Phase 3 | ✅ 完成 | 100% | 6 項 |
| Phase 4 | 進行中 | 0% | 5 項 |
| Phase 5 | 部分完成 | 33% | 6 項 |
| Phase 6 | 未開始 | 0% | 4 項 |
| Phase 7 | 未開始 | 0% | 3 項 |
| **v1 小計** | - | **~60%** | **37 項** |
| Phase 8 | 未開始 | 0% | 6 項 |
| Phase 9 | 未開始 | 0% | 9 項 |
| Phase 10 | 未開始 | 0% | 6 項 |
| Phase 11 | 未開始 | 0% | 4 項 |
| **v2 小計** | - | **0%** | **25 項** |
| **總計** | - | **~35%** | **62 項** |

---

## 依賴關係

```
MVP v1:
────────────────────────────────────────────
Phase 1 (初始化) ✅
    ↓
Phase 2 (UI) ✅ ←──────────────┐
    ↓                          │
Phase 3 (基礎互動) ✅           │
    ↓                          │
Phase 4 (AI 對話) ─────────────┤
    ↓                          │
Phase 5 (情境) ────────────────┘
    ↓
Phase 6 (整合測試)
    ↓
Phase 7 (部署 v1)
    ↓
────────────────────────────────────────────
MVP v2:
────────────────────────────────────────────
Phase 8 (動態病人)
    ↓
Phase 9 (ACLS) ←── 依賴 Phase 8 惡化觸發
    ↓
Phase 10 (交班報告) ←── 可與 Phase 9 並行
    ↓
Phase 11 (計分與 Debrief)
    ↓
部署 v2
────────────────────────────────────────────
```

**v1 關鍵路徑：** 1 → 2 → 3 → 5 → 6 → 7
**v2 關鍵路徑：** 8 → 9 → 11

---

## 技術架構擴充（v2）

### 新增檔案結構

```
lib/
├── vital-engine.ts      # 動態 vitals 計算引擎
├── acls-engine.ts       # ACLS 流程控制
├── scoring.ts           # 計分系統
└── types.ts             # 擴充類型定義

components/
├── acls/
│   ├── ACLSMode.tsx         # ACLS 主介面
│   ├── RhythmDisplay.tsx    # ECG 波形顯示
│   ├── ACLSActions.tsx      # 動作按鈕組
│   └── ACLSMedications.tsx  # 藥物選單
├── modals/
│   ├── HandoffModal.tsx     # 交班報告輸入
│   └── HandoffFeedback.tsx  # 學長回饋顯示
└── ui/
    ├── Timer.tsx            # 計時器
    └── ScoreDisplay.tsx     # 分數顯示

app/api/
├── evaluate-handoff/
│   └── route.ts             # 交班評估 API
```

### 新增 API

| Endpoint | Method | 用途 |
|----------|--------|------|
| `/api/evaluate-handoff` | POST | 學長 AI 評估交班報告 |

---

## 風險與注意事項

| 風險 | 影響程度 | 對應策略 |
|------|----------|----------|
| POCUS 素材未備妥 | 中 | 先用 placeholder，素材到位後替換 |
| Claude API 成本超支 | 低 | 使用 Haiku model、設定 max_tokens |
| 醫學內容正確性 | 高 | 請用戶（醫師）審核情境資料 |
| 響應式設計複雜 | 低 | MVP 先專注桌機，平板次之 |
| ECG 波形製作複雜 | 中 | 可用靜態 SVG 或 GIF，不需即時繪製 |
| ACLS 流程複雜度 | 中 | 簡化為單一心律處理，不做完整 MEGACODE |

---

## 開發建議

### 給 `/coder` 的指引（v2 擴充）

**Phase 8 - 動態病人**
1. VitalEngine 是核心，需要仔細設計
2. 使用 setInterval 或 requestAnimationFrame 更新 vitals
3. 處置效果可以用 setTimeout 延遲執行
4. 注意記憶體洩漏（cleanup intervals）

**Phase 9 - ACLS**
1. ACLS 模式是獨立的「子遊戲」，可以獨立開發測試
2. ECG 波形可以用 SVG path 或預錄 GIF
3. 2 分鐘循環用 useEffect + setInterval
4. 簡化：一次只處理一種心律

**Phase 10 - 交班報告**
1. SBAR 輸入可以用 4 個 textarea
2. AI 評估 prompt 要精心設計
3. 回饋顯示要結構化，方便閱讀

**Phase 11 - 計分**
1. 分數計算集中在 scoring.ts
2. 即時分數可以用 Zustand store 管理
3. Debrief 要整合前面所有數據

---

## 變更記錄

| 日期 | 變更內容 |
|------|----------|
| 2025-12-14 | 初版建立，37 項任務規劃完成（v1） |
| 2025-12-14 | 🆕 新增 Phase 8-11，共 25 項新任務（v2） |
| 2025-12-14 | 更新進度：Phase 1-3 完成，Phase 5 部分完成 |
