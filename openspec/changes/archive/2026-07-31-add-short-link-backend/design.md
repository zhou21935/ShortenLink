## Context

現有 Vue 前端透過 `createShortLink({ originalUrl, customCode })` mock adapter 回傳 `originalUrl`、`shortCode`、`shortUrl` 與 `clickCount`，但專案尚無後端或持久化層。本變更新增獨立的 Node.js/Express 服務，使用 `pg` 連至 Supabase 的 pooled PostgreSQL connection，並維持可供既有前端後續串接的資料形狀。

## Goals / Non-Goals

**Goals:**

- 提供建立、查詢與公開導向短網址的 HTTP 介面。
- 由後端執行與前端規格一致的 URL 與自訂短碼驗證。
- 以 PostgreSQL 唯一約束作為短碼唯一性的最終保證。
- 使用單一 SQL 更新原子遞增點擊數。
- 提供可測試、可由環境變數設定的 Express 應用程式與資料庫連線。

**Non-Goals:**

- 本變更不串接或修改 Vue 前端，也不新增短碼衝突的前端專屬提示。
- 不包含登入、擁有者、管理後台、連結到期、刪除、編輯、分析報表、限流或自訂網域。
- 不透過 Supabase SDK、REST Data API 或 Supabase RPC 存取資料。
- 不建立自訂 404 前端畫面。

## Decisions

### Express 應用程式與啟動程序分離

`server/src/app.js` 建立並匯出 Express app，`server/src/server.js` 才讀取監聽埠並啟動程序。測試可直接載入 app 而不開啟真實 TCP listener。路由層處理 HTTP 轉換，service 層擁有 SQL 與短碼建立規則；不再增加只轉呼叫的 repository wrapper。

替代方案是把啟動、路由和 SQL 放在單一檔案，但會讓整合測試與錯誤映射耦合。

### 使用 pg 連接 Supabase pooled PostgreSQL

`server/src/db/pool.js` 建立單一 `pg.Pool`，連線字串由 `DATABASE_URL` 提供；正式環境連線啟用 TLS。這能直接使用 constraint、`UPDATE ... RETURNING` 與參數化 SQL。

替代方案 Supabase JavaScript SDK 會增加 REST 邊界；原子遞增仍需 RPC，因此本 MVP 不採用。

### short_links 資料表是唯一持久化模型

migration 建立 `short_links`，欄位為 UUID `id`、TEXT `original_url`、VARCHAR(32) `short_code`、BIGINT `click_count`（預設 0 且非負）及 TIMESTAMPTZ `created_at`。`short_code` 使用唯一約束；所有 SQL 使用參數化查詢。

替代方案是在應用程式先查詢再寫入，但並行請求仍可能競爭，不能取代資料庫約束。

### 自動短碼使用密碼學安全隨機值並有限重試

未提供 `customCode` 時，伺服器產生 7 位 ASCII 英數短碼。若 insert 遇到唯一性衝突，最多重新產生並嘗試 5 次；全部衝突時回傳 HTTP 503 與 `SHORT_CODE_GENERATION_FAILED`。自訂短碼衝突不重試，直接回傳 HTTP 409 與 `SHORT_CODE_CONFLICT`。

替代方案是序號編碼；它較可預測且需要額外的全域序列契約，本 MVP 不採用。

### 公開導向以單一 SQL 原子更新點擊數

`GET /:shortCode` 執行 `UPDATE short_links SET click_count = click_count + 1 WHERE short_code = $1 RETURNING original_url`。找到資料時回傳 HTTP 302 和 `Location`；找不到時由 Express 回傳 UTF-8 的簡單 HTML 404 頁面。計數代表成功解析到既有短碼的導向請求數，不嘗試排除機器人或重複訪客。

替代方案先 SELECT 再 UPDATE 會增加往返且可能遺失並行增量。

### API 使用穩定 JSON 契約與明確錯誤代碼

`POST /api/short-links` 成功回傳 HTTP 201；`GET /api/short-links/:shortCode` 成功回傳 HTTP 200。成功資料均包含 `originalUrl`、`shortCode`、由 `PUBLIC_BASE_URL` 組合的 `shortUrl`、數值型 `clickCount`。錯誤統一為 `{ "error": { "code": string, "message": string } }`；驗證錯誤為 400、短碼衝突為 409、API 查無資料為 404、未預期資料庫錯誤為 500，且回應不洩漏連線資訊或 SQL。

## Implementation Contract

- 建立請求：`POST /api/short-links` 接受 JSON `{ "originalUrl": string, "customCode"?: string }`；空字串 `customCode` 視為未提供。成功時持久化一筆資料並回傳 201 與完整短網址資料。
- 驗證：`originalUrl` 必須是可由 URL parser 解析且協定恰為 `http:` 或 `https:`；自訂短碼必須符合 `^[A-Za-z0-9_-]{3,32}$`。不合法請求不得寫入資料庫。
- 查詢請求：`GET /api/short-links/:shortCode` 不增加點擊數，存在時回傳資料，不存在時回傳 JSON 404 與 `SHORT_LINK_NOT_FOUND`。
- 導向請求：`GET /:shortCode` 對存在短碼原子增加一次 `click_count` 並回傳 302；不存在時回傳 HTML 404，不增加任何資料。
- 設定：服務啟動需要有效的 `DATABASE_URL` 與絕對 HTTP/HTTPS `PUBLIC_BASE_URL`；`PORT` 選填。缺少或無效的必要設定時啟動必須明確失敗。
- 驗收：後端測試必須涵蓋有效建立、自動短碼、自訂短碼邊界、URL 邊界、409 衝突、查詢不計數、並行安全的點擊遞增、302 Location、JSON 404、HTML 404 與資料庫錯誤遮蔽；專案層級測試與建置命令必須保持通過。
- 範圍：僅新增後端、migration、設定範例及測試；不得修改前端 adapter 或 UI 行為。

## Risks / Trade-offs

- [公開服務可能被大量建立或刷點擊] → 本 MVP 明確不含限流；路由與 service 分層保留後續加入 middleware 的位置。
- [Supabase pooler 與 TLS 設定錯誤會阻止啟動] → 啟動時驗證必要環境變數並在 `.env.example` 記錄格式，不記錄密碼值。
- [隨機短碼理論上可能連續碰撞] → 依賴唯一約束並限制重試 5 次，耗盡時回傳可辨識的 503。
- [BIGINT 由 pg 預設可能回傳字串] → service 在安全整數範圍內明確轉為 JavaScript Number，以維持前端 `clickCount` 數值契約。
- [302 導向會讓每次解析成功都計數，包括機器人] → 將點擊定義為成功導向請求；去重與機器人過濾留待後續能力。
