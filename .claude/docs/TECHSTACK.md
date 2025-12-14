# ICU Simulator - 技術棧 (Tech Stack)

> 由 `/concept` 維護

---

## 總覽

本專案採用 **Next.js 全端框架**，部署於 **Vercel**。選擇此架構的原因：
- 前後端整合，API Routes 處理 Claude API 呼叫
- Vercel 部署簡單，支援 Serverless Functions
- React 生態系成熟，元件豐富

---

## 前端

### 框架
- **Next.js 14+** (App Router)
  - React 18+ 基礎
  - Server Components 支援
  - API Routes 處理後端邏輯

### 狀態管理
- **Zustand**
  - 輕量、簡單
  - 管理遊戲狀態（vitals, 對話紀錄, 已開檢驗等）

### 樣式方案
- **Tailwind CSS**
  - 快速開發
  - 響應式設計容易
- **shadcn/ui**
  - 高品質 UI 元件庫
  - 客製化彈性高

### 建構工具
- Next.js 內建（Turbopack / Webpack）

---

## 後端

### API 架構
- **Next.js API Routes** (App Router: `app/api/`)
  - `/api/chat` - 處理病史對話（Claude API）
  - `/api/scenario` - 載入情境資料
  - `/api/validate` - 驗證醫囑劑量

### AI 整合
- **Anthropic Claude API**
  - Model: `claude-3-5-sonnet` 或 `claude-3-haiku`（視成本考量）
  - 用途：根據情境設定回應病史詢問

### API 風格
- REST API
- JSON 格式

---

## 資料庫

### MVP 階段
- **不使用資料庫**
- 情境資料：JSON 檔案（`/scenarios/*.json`）
- 遊戲狀態：前端 Zustand store

### 未來擴充
- **Vercel KV** 或 **Vercel Postgres**
  - 儲存學習紀錄
  - 帳號系統資料

---

## 檔案結構

```
icu-simulator/
├── app/
│   ├── page.tsx                 # 主頁面
│   ├── layout.tsx               # 全域 Layout
│   ├── globals.css              # 全域樣式
│   └── api/
│       ├── chat/
│       │   └── route.ts         # 對話 API
│       ├── scenario/
│       │   └── route.ts         # 情境載入 API
│       └── validate/
│           └── route.ts         # 醫囑驗證 API
├── components/
│   ├── ui/                      # shadcn/ui 元件
│   ├── VitalSignsPanel.tsx      # Vital Signs 面板
│   ├── StatusPanel.tsx          # Current Status 面板
│   ├── ChatArea.tsx             # 對話區
│   ├── ActionPanel.tsx          # 動作面板
│   ├── LabResultsModal.tsx      # 檢驗報告 Modal
│   ├── POCUSModal.tsx           # POCUS 顯示 Modal
│   ├── OrdersModal.tsx          # 醫囑開立 Modal
│   └── DebriefModal.tsx         # Debrief 結果 Modal
├── lib/
│   ├── store.ts                 # Zustand store
│   ├── claude.ts                # Claude API 封裝
│   ├── validators.ts            # 醫囑劑量驗證
│   └── types.ts                 # TypeScript 類型定義
├── scenarios/
│   └── cardiogenic-shock-01/
│       ├── scenario.json
│       └── assets/
│           ├── echo-plax.mp4
│           └── ...
├── public/
│   └── (靜態資源)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## 開發工具

### 程式碼品質
- **TypeScript** - 類型安全
- **ESLint** - 程式碼檢查
- **Prettier** - 程式碼格式化

### 測試框架（未來）
- **Vitest** - 單元測試
- **Playwright** - E2E 測試

### 版本控制
- Git
- GitHub

---

## 部署環境

### 平台
- **Vercel**
  - 自動 CI/CD（push to main 自動部署）
  - Serverless Functions 處理 API
  - Edge Network 加速

### 環境變數
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 開發流程
1. Local 開發：`npm run dev`
2. Push to GitHub
3. Vercel 自動部署

---

## 選擇原因

| 技術 | 選擇原因 |
|------|----------|
| Next.js | 全端整合、Vercel 原生支援、React 生態系 |
| Tailwind CSS | 快速開發 UI、響應式簡單 |
| shadcn/ui | 高品質元件、可客製化、不增加 bundle size |
| Zustand | 輕量狀態管理、學習曲線低 |
| Claude API | 自然語言對話品質佳、支援繁體中文 |
| Vercel | 部署簡單、免費額度足夠 MVP |

---

## 效能考量

### 前端
- 使用 Next.js Image 優化圖片
- 影片使用 lazy loading
- 元件按需載入（dynamic import）

### API
- Claude API 呼叫使用 streaming（提升體驗）
- 情境資料可考慮 ISR 預先生成

### 成本控制
- Claude API 選擇適當 model（Haiku 較便宜）
- 設定 max_tokens 限制
- 考慮加入 rate limiting

---

## 變更記錄

| 日期 | 變更內容 |
|------|----------|
| 2024-12-14 | 初版建立 |
