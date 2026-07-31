## Context

目前 Vue build 與 Express API 可獨立運作，但 production 啟動程序不會載入本機環境檔、不會執行 migration、Express 不服務 `dist`，也沒有可供平台判斷 PostgreSQL readiness 的 endpoint。現有 migration 使用 `IF NOT EXISTS`，適合包裝成可重複執行的 CLI。實際部署平台與 secrets 尚未選定，本變更只建立可在任意 Node hosting 使用的 runtime。

## Goals / Non-Goals

**Goals:**

- 以一致的環境載入規則支援本機 `.env` 與平台注入 secrets。
- 提供 transaction 包裝、可重複執行、失敗回傳非零狀態的 migration CLI。
- 以 `/api/health` 驗證 process 與 PostgreSQL readiness，失敗不洩漏內部資訊。
- production mode 由單一 Express process 服務 Vite build、API 與短網址 redirect。
- 提供 root scripts 與 README，使新環境能照文件完成部署前驗收。

**Non-Goals:**

- 不建立或部署 Supabase、Render、Railway、Fly.io、Vercel 或其他雲端資源。
- 不儲存真實 `DATABASE_URL`、密碼、token 或 production domain。
- 不新增認證、rate limiting、監控供應商、備份排程或自動 schema version table。
- 不在本變更執行 migration 到真實遠端資料庫。

## Decisions

### 環境變數優先於本機 env file

使用 `dotenv/config` 在 server entrypoint 與 migration CLI 啟動時載入 `server/.env`；dotenv 預設不覆蓋 process 已存在值，因此 hosting 平台注入的 secrets 優先。`server/.env` 保持 git ignored，`server/.env.example` 只包含假值與欄位說明。替代方案是只使用 Node `--env-file`，但會綁定較新的 Node CLI 版本且難以讓兩個 entrypoint 共用。

### Migration CLI 以單一 transaction 執行既有 SQL

`server/src/migrate.js` 讀取固定 migration 檔，使用 `pg.Pool` 取得 client，以 `BEGIN`、SQL、`COMMIT` 執行，錯誤時 `ROLLBACK`、遮蔽連線字串並設定非零 exit code，最後關閉 pool。既有 SQL 的 extension/table `IF NOT EXISTS` 讓重跑安全。此次不引入 migration framework，因目前只有一個 migration。

### Readiness endpoint 查詢 PostgreSQL

`GET /api/health` 呼叫注入的 `healthCheck`，成功回傳 200 `{ "status": "ok" }`；資料庫拒絕或逾時回傳 503 `{ "status": "unavailable" }`，不經一般 500 error body，也不包含錯誤細節。server entrypoint 以 `SELECT 1` 實作 healthCheck，測試注入 resolved/rejected function。

### Production 單一 origin 與靜態路由順序

`NODE_ENV=production` 時 server entrypoint 將 root `dist` 絕對路徑傳入 `createApp`。app 依序註冊 JSON/API、靜態檔、首頁，再註冊 `/:shortCode`，確保 `/assets/*` 不被視為短碼，`/api/*` 不被 SPA fallback 攔截。若 production build 目錄或 `index.html` 不存在，startup 在監聽 port 前失敗。

### Root scripts 與操作文件是部署前介面

root 提供 `dev:all`、`db:migrate`、`start:production` 與既有 build/test scripts；`start:production` 只啟動已 build 的 runtime，不偷偷修改資料庫，migration 必須是顯式步驟。README 列出 install、env、Supabase SQL/migration、build、start、health、smoke test 與 rollback 檢查。實際 platform deployment 保留到最後一個獨立 change。

## Implementation Contract

- Environment: `DATABASE_URL`、`PUBLIC_BASE_URL` 保持必填；`PORT` 預設 3000；`NODE_ENV=production` 啟用 PostgreSQL SSL 與靜態前端。process environment 必須優先於 `server/.env`，任何真實 secret 不得進 Git。
- Migration: `npm run db:migrate` 對 `server/migrations/001_create_short_links.sql` 執行一次 transaction；成功 exit 0 並輸出不含 secret 的完成訊息，失敗 rollback、exit 非零並關閉 pool。相同資料庫連續執行兩次都必須成功。
- Health: `GET /api/health` 在 `SELECT 1` 成功時回傳 200 JSON `{ "status": "ok" }`，失敗時回傳 503 JSON `{ "status": "unavailable" }`，response 不得包含 SQL、stack、host、username 或 password。
- Production HTTP: build 後以 production mode 啟動時，`GET /` 回傳 Vite `index.html`，`GET /assets/<built-file>` 回傳資產，`POST /api/short-links` 保持 API 行為，`GET /:shortCode` 保持 302/404 行為。缺少 `dist/index.html` 時不得開始監聽。
- Commands: `npm run dev:all` 同時啟動 Vite 與 Express development processes；`npm run db:migrate` 執行 migration；`npm run build` 建置前端；`npm run start:production` 啟動已建置的單一 Express runtime。
- Acceptance: runtime tests、完整 `npm test`、`npm run build`、migration dry test、`spectra analyze prepare-production-runtime --json`、`spectra validate prepare-production-runtime` 與 secret scan 全部通過。
- In scope: environment loading、migration CLI、readiness、static serving、scripts、example env、README 與測試。
- Out of scope: 真實 Supabase 連線、DNS/TLS、hosting config、CI/CD、observability vendor、backup 與實際 deployment。

## Risks / Trade-offs

- [dotenv 載入錯誤檔案] → entrypoints 以 module-relative 絕對路徑指定 `server/.env`，不依賴目前 working directory。
- [production 靜態路由吃掉短碼] → static middleware 與首頁 route 放在 `/:shortCode` 前，且不加入任意 SPA fallback。
- [migration 中途失敗] → 單一 transaction rollback 並在 finally 關閉 pool。
- [health endpoint 洩漏資料庫錯誤] → 固定兩種 response shape，原始 error 僅留在 server-side logging scope且 HTTP 不回傳。
- [平台要求 build 與 start 分離] → `start:production` 不執行 build 或 migration，讓平台生命週期可明確配置。
