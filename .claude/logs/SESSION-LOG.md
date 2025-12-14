# Session Log

> 每次 CLI 啟動時必讀此檔案，了解專案進度與待辦事項

---

## Session: 2025-12-14 初始化

### 變更摘要
- 建立專案模板框架
- 建立 CLAUDE.md 主要說明文件
- 建立 `/concept` subagent (概念設計師)
- 建立 `/pm` subagent (專案經理)
- 建立文件模板：PRD.md, TECHSTACK.md, IMPLEMENTATION-PLAN.md
- 建立 log 系統

### 決策記錄
- 採用 `.claude/` 目錄結構管理所有 Claude Code 相關檔案
- Subagent 使用 slash command 方式實作，放在 `.claude/commands/`
- Log 使用累積式 Markdown 格式，每次 session 新增一個區塊
- 工作流程：Concept 先行 → PM 接手規劃 → 動態建立其他 Subagent

### 待辦事項
- [x] 使用此模板開始新專案時，執行 `/concept` 討論專案概念
- [x] 更新 CLAUDE.md 中的 `[PROJECT_NAME]`
- [x] 填寫 PRD.md
- [x] 填寫 TECHSTACK.md
- [x] 執行 `/pm` 建立實作計畫

---

## Session: 2025-12-14 (Concept 討論)

### 變更摘要
- 完成 PRD v0.1 撰寫
- 完成 TECHSTACK v0.1 撰寫
- 更新 CLAUDE.md 專案名稱為 ICU Simulator
- 定義首個情境：Cardiogenic shock mimicking septic shock

### 決策記錄

**專案核心決策：**
| 項目 | 決定 | 原因 |
|------|------|------|
| 互動方式 | 混合式（對話 + 選單） | 對話更貼近臨床，選單降低操作門檻 |
| 問病史 | 純 AI 生成（Claude API） | 自然、彈性，訓練學員問對問題 |
| Vital Signs | MVP 靜態，架構預留動態 | 降低初期複雜度 |
| 語言 | 介面中文，醫學術語英文 | 符合台灣臨床習慣 |
| 報告格式 | 台灣醫院常見格式 | 貼近實務 |
| 醫囑 | 具體藥物 + 劑量 + 頻次 | 訓練完整處方能力 |
| 劑量驗證 | 要，警告不合理劑量 | 教育意義 |
| POCUS | 用戶提供圖片/影片素材 | 真實感 |
| 部署 | Vercel，先 local 開發 | 簡單、免費 |
| 登入 | MVP 不需要 | 簡化 |

**技術棧決策：**
- Next.js 14+ (App Router) - 全端整合
- Tailwind CSS + shadcn/ui - 快速開發
- Zustand - 輕量狀態管理
- Claude API - 對話生成

**Subagent 分工澄清：**
- `/concept` 和 `/pm` 不寫 code
- 寫 code 的是 `/coder` 全端開發 subagent
- PM 負責建立和協調這些開發 subagent

### 待辦事項
- [x] 執行 `/pm` 建立實作計畫
- [x] PM 建立開發用 subagent（/coder）
- [x] 開始開發 MVP
- [ ] 準備 POCUS 素材（echo 影片、圖片）
- [x] 撰寫 PRD.md
- [x] 撰寫 TECHSTACK.md
- [x] 更新 CLAUDE.md

---

## Session: 2025-12-14 (PM 規劃)

### 變更摘要
- 完成 IMPLEMENTATION-PLAN.md（7 Phase、37 項任務）
- 建立 `/coder` subagent

### 決策記錄
- 使用單一 `/coder` 而非分 frontend/backend，因為 Next.js 全端整合
- `/scenario` subagent 延後到 Phase 5 再建立
- 關鍵路徑：Phase 1 → 2 → 3 → 5 → 6 → 7
- Phase 4（AI 對話）可與 Phase 3 並行

### 待辦事項
- [x] 執行 `/coder` 開始 Phase 1
- [x] Phase 1 完成後更新進度
- [x] 撰寫 IMPLEMENTATION-PLAN.md
- [x] 建立 `/coder` subagent

---

## Session: 2025-12-14 (Phase 1-3 開發)

### 變更摘要
- 完成 Phase 1: 專案初始化（Next.js, Tailwind, shadcn/ui, Zustand）
- 完成 Phase 2: 核心 UI 開發（VitalSignsPanel, StatusPanel, ChatArea, ActionPanel）
- 完成 Phase 3: 互動功能基礎（所有 Modal 元件）
- 建立完整的 TypeScript 類型定義
- 建立 Zustand store 遊戲狀態管理
- 建立藥物劑量驗證系統

### 決策記錄
- 手動建立 package.json 解決目錄名稱空格問題
- 使用 next.config.mjs 而非 .ts（版本相容）
- Lab results 使用 `as unknown as Record<string, number>` 解決 TypeScript 類型問題
- Demo scenario 暫時內嵌於 GameLayout，未來移至獨立 JSON

### 待辦事項
- [ ] Phase 4: AI 對話整合（需設定 Claude API Key）
- [ ] Phase 5: 情境 JSON 獨立檔案
- [ ] Phase 6: 整合測試
- [ ] Phase 7: Vercel 部署

---

## Session: 2025-12-14 (Concept Review & PRD v0.2) 🆕

### 變更摘要
- `/concept` 檢視目前實作與 PRD 符合度（~90%）
- 討論臨床真實性、遊戲性、互動性改善方向
- 確定 v2 新功能方向：
  - 動態病人狀態系統
  - ACLS/MEGACODE 急救模式
  - 交班報告系統（SBAR + AI 學長評估）
  - 計分系統
- 更新 PRD.md 至 v0.2
- 更新 IMPLEMENTATION-PLAN.md 新增 Phase 8-11

### 決策記錄

**v2 核心新增功能：**
| 功能 | 說明 | 教學價值 |
|------|------|----------|
| 動態病人 | 處置有後果，vitals 會變化 | 學習處置的即時影響 |
| ACLS/MEGACODE | 惡化時進入急救模式 | 練習心律判讀、ACLS 流程 |
| 交班報告 | SBAR 格式 + AI 學長即時回饋 | 練習結構化溝通 |
| 計分系統 | 診斷/處置/ACLS/交班 各項計分 | 量化學習成效 |

**技術擴充：**
- `lib/vital-engine.ts` - 動態 vitals 計算引擎
- `lib/acls-engine.ts` - ACLS 流程控制
- `lib/scoring.ts` - 計分系統
- `components/acls/` - ACLS 模式元件
- `components/modals/HandoffModal.tsx` - 交班報告介面
- `/api/evaluate-handoff` - 學長 AI 評估 API

**實作計畫調整：**
- 原 37 項任務 → 新增 25 項 → 總計 62 項
- MVP v1（Phase 1-7）：靜態病人、基本互動
- MVP v2（Phase 8-11）：動態病人、ACLS、交班、計分

### 待辦事項
- [ ] 完成 v1 剩餘工作（Phase 4-7）
- [ ] 設定 Claude API Key
- [ ] 準備 POCUS 素材
- [ ] 開始 Phase 8: 動態病人系統
- [ ] 準備 ECG 波形素材（SVG/GIF）

---

## Session: 2025-12-14 (Lab 介面改版 & Airway Management 規劃)

### 變更摘要
- 重新設計 Lab 開立介面（LabOrderModal.tsx）
  - 從「整包選」改為「個別勾選」，更貼近真實臨床
  - CBC、ABG 保留為 bundle（臨床合理）
  - 新增 60+ 個別檢驗項目（7 大類別）
  - 新增培養項目：Blood/Urine/Sputum/Wound Culture
  - 培養項目有更長的結果延遲（5秒 vs 2秒）
- 更新 LabResultsModal.tsx 支援培養結果
  - 顯示「培養中...」狀態 badge
  - 支援非數值（qualitative）結果
- 安裝 shadcn/ui 新元件：badge, separator
- 更新 PRD.md 至 v0.2（新增 Section 13）
- 更新 IMPLEMENTATION-PLAN.md 新增 Phase 12

### 決策記錄

**Lab 開立介面改版：**
| 項目 | 原設計 | 新設計 | 原因 |
|------|--------|--------|------|
| CBC | 整包 | 整包（保留） | 臨床上通常整組開 |
| ABG | 整包 | 整包（保留） | 同上 |
| 生化 | 整包 | 個別勾選 | 訓練學員依臨床情況選擇 |
| 培養 | 無 | 新增 4 項 | 感染症診斷必備 |

**Airway/Breathing Management 規劃：**
| 功能 | 說明 | 教學價值 |
|------|------|----------|
| SpO2 警示 | <92% 黃警、<88% 紅警 + 護理師提醒 | 學習及早介入 |
| 氧氣治療 | NC → Mask → NRM → HFNC → BiPAP | 熟悉各設備適用情境 |
| 插管決策 | RSI 藥物選擇（Sedation + Paralytic） | 學習 RSI 流程與藥物 |
| 呼吸器設定 | AC/VC, AC/PC, SIMV, PSV + 參數 | 熟悉呼吸器操作 |

**任務數更新：**
- 原 62 項任務 → 新增 9 項 → 總計 71 項
- Phase 12 可與 Phase 9 (ACLS) 並行開發

### 待辦事項
- [ ] 完成 v1 剩餘工作（Phase 4-7）
- [ ] 設定 Claude API Key
- [ ] 準備 POCUS 素材
- [ ] 開始 Phase 8: 動態病人系統
- [ ] 開始 Phase 12: Airway/Breathing Management
- [ ] 準備 ECG 波形素材（SVG/GIF）

---

## Session: 2025-12-14 (Phase 4 完成 + 交班報告功能)

### 變更摘要
- **Phase 4 完成**：AI 對話整合
  - `/api/chat` API Route
  - `lib/claude.ts` Claude API 封裝
  - Streaming 回應實作
  - 護理師 AI 角色設定
- **交班報告功能**（取代原本的提交診斷）
  - `HandoffModal` - 自由輸入，模擬電話交班
  - `/api/evaluate-handoff` - AI 學長評估 API
  - 學長口語化回饋（像真的電話回應）
- 新增 UI 元件：textarea, label

### 決策記錄

**Phase 4 技術決策：**
- 使用 `claude-sonnet-4-20250514` 模型
- Streaming 回應提升 UX
- 護理師 AI 不主動給建議，只回答被問的問題

**交班報告設計變更：**
| 原設計 | 新設計 | 原因 |
|--------|--------|------|
| SBAR 四欄位 | 單一自由輸入 | 更像真實電話交班 |
| 結構化表單 | 模擬對話情境 | 訓練口語報告能力 |

**學長 AI 評估設計：**
- 評估完整度、準確度、條理性
- 口語化回饋（「嗯」「好」「那個...」）
- 分數 + 優點 + 遺漏 + 建議

### 待辦事項
- [ ] Phase 5: 情境 JSON 獨立檔案
- [ ] Phase 6: 整合測試
- [ ] Phase 7: Vercel 部署
- [ ] 準備 POCUS 素材（echo 影片、圖片）
- [ ] 準備 ECG 波形素材（SVG/GIF）
- [ ] Phase 8+: v2 功能開發

### 目前進度
- **v1 完成度**: ~75%（Phase 1-4 ✅, Phase 5 部分完成）
- **總任務數**: 71 項（v1: 37 項, v2: 34 項）

---

<!-- 新的 session 記錄請加在這裡 -->
