## 1. 後端骨架與設定

- [x] 1.1 建立 `server/package.json`、測試工具與專案層級 scripts，使 Node.js/Express 後端可獨立啟動、測試，且根目錄測試命令同時涵蓋前後端；以 `npm test` 與後端 smoke test 驗證。（對應「Express 應用程式與啟動程序分離」）
- [x] 1.2 實作 Backend configuration：驗證 `DATABASE_URL`、絕對 HTTP/HTTPS `PUBLIC_BASE_URL` 與選填 `PORT`，提供不含秘密的 `server/.env.example`，並以設定單元測試驗證有效值與缺漏時啟動失敗。（對應「API 使用穩定 JSON 契約與明確錯誤代碼」的 base URL 契約）
- [x] 1.3 建立可注入 service 的 Express app 與獨立 listener，確保測試載入 app 時不開啟 TCP port；以 app smoke test 驗證 JSON parsing、route precedence 與啟動程序分離。

## 2. 資料庫與核心服務

- [x] 2.1 實作 Short link persistence：在 `server/migrations/001_create_short_links.sql` 建立 `short_links` UUID 主鍵、原始網址、唯一短碼、非負 BIGINT 點擊數及時間戳，並以 migration integration test 驗證預設值與唯一約束。（對應「short_links 資料表是唯一持久化模型」）
- [x] 2.2 建立由 `DATABASE_URL` 設定的單一 `pg.Pool`、參數化查詢與 BIGINT 安全數值轉換，並以資料庫 adapter 測試驗證 Supabase pooled PostgreSQL 連線選項及查詢結果形狀。（對應「使用 pg 連接 Supabase pooled PostgreSQL」）
- [x] 2.3 實作 Creation input validation：只接受 HTTP/HTTPS 原始網址，以及空值或符合 `^[A-Za-z0-9_-]{3,32}$` 的自訂短碼；以表格驅動測試覆蓋 spec 的最小、最大、空值、缺少協定、FTP 與斜線案例，並斷言失敗時未呼叫資料庫。
- [x] 2.4 實作 Short link creation API 與 Duplicate custom short-code response：支援自訂碼及 7 位安全隨機自動碼、最多 5 次自動碰撞重試、201 成功資料、409 `SHORT_CODE_CONFLICT` 和 503 `SHORT_CODE_GENERATION_FAILED`；以 route/service 測試驗證每個狀態、重試次數與回應形狀。（對應「自動短碼使用密碼學安全隨機值並有限重試」）

## 3. 查詢、導向與錯誤

- [x] 3.1 實作 Short link metadata API：`GET /api/short-links/:shortCode` 回傳原始網址、短碼、公開短網址與數值型點擊數且不遞增計數，缺少資料時回傳 JSON 404 `SHORT_LINK_NOT_FOUND`；以整合測試驗證查詢前後計數不變。
- [x] 3.2 實作 Redirect and atomic click counting：`GET /:shortCode` 使用單一 `UPDATE ... RETURNING` 對既有短碼加一並回傳 302 Location，不存在時回傳 UTF-8 簡單 HTML 404；以整合測試驗證 10 個並行請求後計數精確增加 10。（對應「公開導向以單一 SQL 原子更新點擊數」）
- [x] 3.3 實作 Safe backend failures：集中映射 400、404、409、500、503，確保 API 使用 `{ "error": { "code", "message" } }` 且任何回應不含 SQL、憑證、連線字串或 stack trace；以注入資料庫錯誤的 route tests 驗證 API 與 redirect 失敗不終止程序也不誤發 302。（對應「API 使用穩定 JSON 契約與明確錯誤代碼」）

## 4. 完整驗收

- [x] 4.1 執行 migration 測試、後端單元/整合測試、根目錄 `npm test`、`npm run build`、`spectra analyze add-short-link-backend --json` 與 `spectra validate add-short-link-backend`，確認 Implementation Contract 的建立、驗證、衝突、查詢、原子計數、302、JSON/HTML 404 與錯誤遮蔽全部通過，且未修改前端 adapter 或 UI。
