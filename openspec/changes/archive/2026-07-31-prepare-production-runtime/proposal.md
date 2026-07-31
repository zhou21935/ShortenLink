## Why

核心短網址功能已完成，但目前仍缺少可重複執行的資料庫 migration、環境檔載入、健康檢查、production 靜態前端服務與上線操作文件。先補齊平台無關的 runtime 契約，才能在最後選定平台後安全部署，而不是把設定與資料庫步驟留給人工猜測。

## What Changes

- 新增 production runtime capability，定義必要環境變數、啟動前 migration、健康檢查與單一 HTTP process 行為。
- 提供可重複執行且失敗時回傳非零 exit code 的 migration CLI，使用與後端相同的 PostgreSQL 連線設定。
- 讓 server 直接載入本機 `server/.env`（若存在），同時保留部署平台注入環境變數的優先權。
- 在 production mode 由 Express 服務 Vite build 輸出，讓 `/api/*`、前端首頁與 `/:shortCode` 共用同一 origin。
- 新增資料庫 readiness endpoint，資料庫不可用時回傳 503 且不洩漏連線資訊。
- 新增根目錄 build、migration、production start 與本機雙服務啟動 scripts，以及從 Supabase 建立到部署前驗收的 README 操作文件。
- 不建立雲端專案、不寫入真實 secrets、不執行實際部署。

## Capabilities

### New Capabilities

- `production-runtime`: 可重複的環境載入、migration、readiness、production 靜態服務與操作契約。

### Modified Capabilities

(none)

## Impact

- Affected specs: production-runtime
- Affected code:
  - New: server/src/migrate.js, server/test/runtime.test.js, README.md
  - Modified: package.json, package-lock.json, server/package.json, server/package-lock.json, server/.env.example, server/src/app.js, server/src/config.js, server/src/server.js, server/test/backend.test.js, .gitignore
  - Removed: (none)
- External interfaces: GET /api/health, npm run db:migrate, npm run start:production
- Dependencies: dotenv for explicit local environment-file loading; concurrently for local dual-service startup
