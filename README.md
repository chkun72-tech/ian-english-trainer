# Ian English Trainer (MVP)

個人化英文學習 App — 根據 Ian 在雪梨的 Handyman / Moving / 安裝 / 客戶溝通 / 健身 / AI 專案生活，
每天 10–20 分鐘練習今天會用到的英文。

## 快速啟動

```bash
npm install
npm run dev
```

然後打開 http://localhost:3000

（手機建議用 Chrome 開發者工具的「手機模式」預覽，或之後部署到 Vercel 後直接用手機瀏覽器打開。）

## 技術

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- 純前端、本地 JSON 資料，無後端、無資料庫、無登入
- 學習進度（單字掌握程度、每日設定）存在瀏覽器 `localStorage`，換瀏覽器或清除快取會重置

## 專案結構

```
app/
  page.tsx              首頁：選擇今日場景 + 整體進度
  lesson/page.tsx        Today Lesson：單字／句子／對話／測驗／checklist 分頁
  vocabulary/page.tsx    所有單字、可依場景篩選、可標記掌握程度
  phrases/page.tsx       我的句庫（報價／時間／現場／收款／Review／健身／AI）
  practice/page.tsx      中文提示 → 自己打英文 → 看參考答案
  settings/page.tsx      設定每天學幾個單字 / 幾句句子
data/
  scenarios.json         6 個場景的單字／句子／對話／測驗／checklist
  phrases.json           句庫資料
lib/
  types.ts               資料型別
  storage.ts              localStorage 存取（掌握程度、設定、今日進度）
  data.ts                 讀取 JSON + 「今日複習挑哪些單字」的邏輯
components/
  VocabCard / DialogueView / QuizView / ChecklistView / MasteryBadge / BottomNav
```

## 目前內建的 6 個場景

1. Curtain / Blinds Installation 窗簾/百葉窗安裝
2. Moving 搬家
3. Handyman General 水電雜工
4. Customer Quote 客戶報價
5. Gym 健身
6. AI Project AI 專案

每個場景都有：10 個單字、5 句句子、1 段情境對話、3 題小測驗、工作前 checklist。

## 記憶系統怎麼運作

每個單字可標記：New → Learning → Familiar → Mastered（點單字卡右上角的標籤就會循環切換）。

Today Lesson 的「今日單字」會優先顯示 **Learning** 和 **Familiar** 的單字，
數量由 Settings 頁的「每天學幾個單字」決定（預設 6 個）。

## 之後可以加的功能（MVP 之後）

- 串接 AI（例如用 Claude/GPT API）自動產生「今天的新單字／句子／對話」，
  根據使用者當天的實際工作行程動態生成
- 口說練習（錄音 + 語音辨識比對）
- 學習紀錄串連到雲端（目前是純本機 localStorage）
- PWA（加到手機主畫面、離線使用）

## 如何新增場景或單字

直接編輯 `data/scenarios.json`（或 `data/phrases.json`），照現有格式新增一個物件即可，
不需要改任何程式碼，重新整理頁面就會生效。
