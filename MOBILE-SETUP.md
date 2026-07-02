# 手機使用說明（AI 專案總控中心）

這份文件教你怎麼在 iPhone 上把 `dashboard/` 這個小型 PWA 加入主畫面，
當作「今日任務總控中心」來用。整個系統只有本機 JSON + 本機 Node
伺服器，沒有登入、沒有雲端、沒有任何第三方 API。

## 1. 如何在電腦啟動本地服務

前提：電腦上要有安裝 Node.js（沒有的話先安裝 Node 18 以上版本）。

```bash
cd ian-english-trainer/dashboard
node server.js
```

看到這行代表啟動成功：

```
Project Dashboard 伺服器已啟動：http://localhost:8791/dashboard.html
```

伺服器會一直在終端機視窗執行，要停止的話按 `Ctrl+C`。

## 2. iPhone 如何打開 dashboard

手機要跟電腦連在「同一個 Wi-Fi」，才能用電腦的區域網路 IP 打開。

1. 在電腦上查出區域網路 IP：
   - Mac：`ipconfig getifaddr en0`（如果是用 Wi-Fi）
   - Windows：`ipconfig`，看「IPv4 位址」那一行
   - Linux：`hostname -I`
2. 假設查到的 IP 是 `192.168.1.23`，就在 iPhone 的 **Safari**（一定要用
   Safari，不要用 Chrome）打開：

   ```
   http://192.168.1.23:8791/dashboard.html
   ```

## 3. 如何加入主畫面

1. 在 Safari 打開上面的網址，確認畫面有正常顯示「今日必做」等區塊。
2. 點下方工具列的「分享」圖示（方框 + 往上箭頭）。
3. 往下滑，點「加入主畫面」。
4. 確認名稱後點右上角「新增」。
5. 之後回到主畫面，會看到一個藍底色塊圖示的捷徑，點下去就會像 App
   一樣全螢幕打開 Dashboard。

## 4. 以後每天怎麼用

1. 電腦開機後，在 `dashboard/` 資料夾執行 `node server.js`（開一次即可，
   關電腦前不用特別關閉）。
2. 用手機主畫面上的捷徑打開 Dashboard，看「今日必做」的 3 件事。
3. 每完成一件事，點卡片下面的「完成」／「延後」／「卡住」按鈕，資料
   會即時更新，並自動重新產生 `daily_checklist.md`、`weekly_review.md`。
4. 有新的專案進度回報（ChatGPT / Cloud Code / Codex / Manus / 你自己）
   時，點 Dashboard 上方的「＋ 匯入更新」，貼上文字即可（詳見
   `PROJECT-UPDATE-FORMAT.md`）。
5. 每天/每次重開機後想重新整理今日清單，也可以手動在 `dashboard/`
   資料夾執行：

   ```bash
   node scripts/rollover_daily_tasks.js
   ```

## 5. 如果網址打不開，怎麼檢查本機 IP、port、防火牆

- **確認手機和電腦在同一個 Wi-Fi**：如果電腦接的是有線網路、手機用
  Wi-Fi，兩邊可能不在同一個網段，會連不到。
- **重新確認 IP 有沒有查對**：IP 有時候換 Wi-Fi 或重開機就會變，重新
  執行第 2 步的指令再查一次。
- **確認伺服器真的有在跑**：終端機視窗要保持開著，且要看到
  `Project Dashboard 伺服器已啟動...` 這行字，沒看到就是還沒啟動成功。
- **防火牆擋住連線**：
  - Mac：「系統設定 → 網路 → 防火牆」，確認防火牆沒有擋住 Node（或暫時
    關閉防火牆測試看看）。
  - Windows：「Windows Defender 防火牆」第一次執行 Node 時通常會跳出
    詢問視窗，記得選「允許存取」（私人網路）。
- **用電腦自己先測試**：先在電腦瀏覽器打開
  `http://localhost:8791/dashboard.html`，如果這樣都打不開，代表是
  伺服器本身沒啟動成功，跟手機、網路都無關，先解決這步再測手機。

## 6. 如果 8791 被占用，如何換 port

如果啟動時看到類似 `EADDRINUSE` 的錯誤，代表 8791 這個 port 已經被別的
程式用掉了。換一個 port 啟動即可，例如換成 8080：

```bash
PORT=8080 node server.js
```

啟動訊息會變成：

```
Project Dashboard 伺服器已啟動：http://localhost:8080/dashboard.html
```

手機上的網址也要跟著改成新的 port，例如：

```
http://192.168.1.23:8080/dashboard.html
```

## 限制提醒

- 沒有登入機制，任何連到同一個 Wi-Fi、知道這個網址的人都能開啟與操作，
  請只在自己家裡的可信任網路環境使用。
- 沒有接雲端、沒有接 Notion / Google Calendar / 任何第三方 API，所有
  資料都只存在 `dashboard/data/*.json` 這幾個本機檔案裡。
- 電腦的 Node 伺服器沒開著的時候，手機主畫面的捷徑就打不開（因為資料
  是即時從本機伺服器讀取，不是預先包好的靜態網站）。
