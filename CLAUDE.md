# Project: ICU Simulator

> ICU 模擬病人教學系統 - 給 Junior R 和 Clerk 練習臨床推理的互動式學習工具

## 專案概述

**ICU Simulator** 是一個醫學教育工具，模擬 ICU 病人惡化情境，讓學員練習：
- 鑑別診斷（如 Cardiogenic shock vs Septic shock）
- 開立檢驗、理學檢查、床邊超音波
- 醫囑開立與劑量判斷

此專案使用 Claude Code 的 Subagent 架構進行開發：
- **Concept** (`/concept`): 概念設計師，負責需求分析與架構設計（不寫 code）
- **PM** (`/pm`): 專案經理，負責規劃任務與協調 subagent（不寫 code）
- **開發 Subagents**: 由 PM 建立，負責實際開發工作

---

## 啟動時必讀

**每次 CLI 啟動時，請先執行以下步驟：**

1. 讀取 `.claude/logs/SESSION-LOG.md` 了解專案進度與待辦事項
2. 檢視最近的決策記錄
3. 根據待辦事項繼續工作

---

## Subagent 架構

### 工作流程

```
用戶需求 → /concept → PRD + TECHSTACK + Subagent 設計
                ↓
         /pm → IMPLEMENTATION-PLAN + 建立 Subagent + 調度執行
                ↓
         完成任務 → 更新 Log → Git Push
```

### 核心 Subagent

| Command | 角色 | 職責 |
|---------|------|------|
| `/concept` | 概念設計師 | 討論需求、撰寫 PRD/TECHSTACK、設計 subagent |
| `/pm` | 專案經理 | 撰寫實作計畫、建立/調動 subagent、追蹤進度 |

### 動態 Subagent

PM 可根據需求建立新的 subagent，存放於 `.claude/commands/` 目錄。

---

## Log 系統

### 檔案位置
`.claude/logs/SESSION-LOG.md`

### 記錄內容
每次 session 結束前，必須更新 log，包含：
- **變更摘要**: 本次完成了什麼
- **決策記錄**: 做了什麼決定、為什麼
- **待辦事項**: 下次需要繼續的工作

### 格式範例
```markdown
## Session: YYYY-MM-DD HH:MM

### 變更摘要
- 完成了 XXX 功能
- 修改了 YYY 檔案

### 決策記錄
- 決定使用 ZZZ 技術，因為...

### 待辦事項
- [ ] 待完成項目 1
- [ ] 待完成項目 2
- [x] 已完成項目（保留追蹤）
```

---

## Git 工作流程

每次 session 結束或有重大變更時：

```bash
git add .
git commit -m "描述變更內容"
git push
```

**Commit Message 規範：**
- `feat:` 新功能
- `fix:` 修復問題
- `docs:` 文件更新
- `refactor:` 重構
- `chore:` 雜項維護

---

## 目錄結構

```
.claude/
├── commands/           # Slash commands (subagents)
│   ├── concept.md      # 概念設計師
│   ├── pm.md           # 專案經理
│   └── [動態建立]       # PM 建立的其他 subagent
├── docs/               # 專案文件
│   ├── PRD.md          # 產品需求文件
│   ├── TECHSTACK.md    # 技術棧說明
│   └── IMPLEMENTATION-PLAN.md  # 實作計畫
└── logs/
    └── SESSION-LOG.md  # Session 記錄

CLAUDE.md               # 本檔案（給 Claude 讀取）
README.md               # 給人類開發者
```

---

## 重要提醒

1. **永遠先讀 Log**: 確保了解專案當前狀態
2. **任務完成即更新 Log**: 不要等到最後才記錄
3. **保持文件同步**: PRD/TECHSTACK 有變動要通知相關 subagent
4. **Git 常態化**: 有意義的變更就 commit
