# PROJECT_UPDATE 格式說明

這份文件定義所有回報系統（ChatGPT、Cloud Code、Codex、Manus、以及你
自己）跟 Dashboard 溝通進度用的固定格式。Dashboard 只認得這個格式，
貼進「＋ 匯入更新」頁面後會自動更新 `projects.json` / `tasks.json`，
並重新產生 `daily_checklist.md`、`weekly_review.md`。

## 標準格式

```
PROJECT_UPDATE
project: 專案名稱
task: 任務名稱
status: active / completed / blocked / paused / parking
priority: A / B / C
next_action: 下一步
source: ChatGPT / Cloud Code / Codex / Manus / User
date: YYYY-MM-DD
notes: 備註
END_PROJECT_UPDATE
```

可以一次貼多個區塊（一個接一個），Dashboard 會逐一解析、逐一匯入。

### 欄位說明

| 欄位 | 必填 | 說明 |
|---|---|---|
| project | 必填 | 專案名稱。第一次出現時會自動新增專案，之後同名會自動比對到同一個專案。 |
| task | 必填 | 任務名稱。同一個 project + task 已存在時會「更新」而不是重複新增。 |
| status | 選填（預設 active） | `active`（今日可能會被排進必做）／`completed`（完成，不再出現在今日必做）／`blocked`（卡住，進「卡住事項」）／`paused`（暫停，進「暫停但不可遺忘」）／`parking`（先放著，進 Parking Lot）。 |
| priority | 選填（預設 C） | `A` / `B` / `C`。今日必做人數不足 3 個時，會優先從 priority A 的 active 任務補上。 |
| next_action | 選填 | 下一步要做的事，會顯示在今日必做卡片上。 |
| source | 選填（預設 User） | 這筆回報是誰產生的：`ChatGPT` / `Cloud Code` / `Codex` / `Manus` / `User`。 |
| date | 選填（預設今天） | 回報日期，格式 `YYYY-MM-DD`。 |
| notes | 選填 | 補充說明，會顯示在對應區塊的卡片上。 |

## ChatGPT 以後怎麼回報

在對話最後，只要有任務狀態變化（開始做、做完、卡住、要暫停、想先放進
Parking Lot），直接在回覆最後面附上一個或多個 `PROJECT_UPDATE` 區塊，
`source` 填 `ChatGPT`。使用者只要把整段回覆（含區塊）複製貼到
Dashboard 的「＋ 匯入更新」頁面即可。

## Cloud Code 以後怎麼回報

每次完成一個明確的開發任務（例如修好一個 bug、做完一個功能、卡在某個
問題上）之後，在最後的回報訊息附上 `PROJECT_UPDATE` 區塊，`source`
填 `Cloud Code`。`task` 建議用具體可辨識的描述（例如「修正登入頁面
RWD」），方便下次比對到同一筆任務並更新狀態。

## Codex 以後怎麼回報

每次跑完一個 coding 任務、或任務因為某個原因卡住需要人工介入時，輸出
`PROJECT_UPDATE` 區塊，`source` 填 `Codex`。如果任務還沒完全做完，
`status` 用 `active` 並在 `next_action` 寫清楚下一步是什麼，方便隔天
Dashboard 自動把這個任務留在今日必做。

## Manus 以後怎麼回報

Manus 每次完成**資料蒐集、整理、分析、或文章草稿**之後，也必須輸出
`PROJECT_UPDATE`，方便 Dashboard 匯入更新。例如：

- 蒐集完一批資料 → `status: active`，`next_action` 寫「待人工複核」
  或下一步要做的整理項目。
- 整理/分析完成、可以交付 → `status: completed`。
- 文章草稿完成、等待審閱 → `status: active`，`next_action` 寫
  「等待審閱」，`notes` 可以附草稿放在哪裡。
- 需要更多資料或素材才能繼續 → `status: blocked`，`notes` 寫清楚
  卡在哪裡、需要什麼。

`source` 一律填 `Manus`。

## User 語音轉文字後怎麼貼入

如果是用手機語音輸入（例如 iPhone 語音轉文字）快速記錄一件事，講完
之後把轉出來的文字**整理成 PROJECT_UPDATE 格式**再貼進「＋ 匯入更新」
頁面，`source` 填 `User`。可以先用最簡單的版本，例如：

```
PROJECT_UPDATE
project: Ian English Trainer
task: 修正發音回饋文案
status: blocked
notes: 語音備忘：使用者覺得回饋語氣太生硬，需要改
END_PROJECT_UPDATE
```

沒填的欄位（priority、next_action、source、date）會自動套用預設值
（`priority: C`、`source: User`、`date: 今天`），先求貼得進去、之後
有空再補齊細節即可。

## 匯入規則摘要

1. `project` 不存在 → 自動新增專案。
2. `task` 不存在 → 自動新增任務。
3. `project` + `task` 已存在 → 更新 `status` / `next_action` / `notes`
   / `last_updated`，不會重複新增。
4. `completed` 的任務不會出現在今日必做。
5. `blocked` 的任務會顯示在「卡住事項」。
6. `paused` 的任務只會顯示在「暫停但不可遺忘」，不會進今日必做。
7. `parking` 的任務進 Parking Lot。
8. `active` 的任務有機會進今日必做，但今日必做最多同時 3 個；不足 3
   個時，會優先從 priority A 的 active 任務自動補上。
9. 每次匯入完成後，都會自動重新產生 `daily_checklist.md` 和
   `weekly_review.md`。
