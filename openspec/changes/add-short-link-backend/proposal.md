## Why

目前應用程式僅以 mock adapter 模擬短網址建立，沒有可持久化、可導向或記錄點擊的後端服務。現在需要建立最小可用的後端，讓短網址具備真實儲存、唯一性與導向行為，並為後續前端串接提供穩定 API。

## What Changes

- 新增 Node.js 與 Express 後端服務。
- 新增建立短網址 API，接受原始網址與選填自訂短碼；未提供短碼時由伺服器自動產生。
- 在伺服器驗證 HTTP/HTTPS 原始網址及 3–32 位短碼格式。
- 使用 Supabase 託管的 PostgreSQL 儲存短網址，並以資料庫唯一約束保證短碼不重複。
- 自訂短碼衝突時回傳 HTTP 409 與穩定錯誤代碼 `SHORT_CODE_CONFLICT`。
- 新增短碼查詢 API，以及會原子遞增點擊數並回傳 HTTP 302 的公開導向路由。
- 短碼不存在時，由 Express 直接回傳簡單的 HTML 404 頁面。

## Capabilities

### New Capabilities

- `short-link-backend`: 短網址的建立、驗證、持久化、查詢、導向、點擊計數、衝突與 404 行為。

### Modified Capabilities

（無）

## Impact

- Affected specs: `short-link-backend`（新增）；`short-link-frontend` 僅作介面參考，不變更需求
- Affected code:
  - New: `server/package.json`, `server/src/app.js`, `server/src/server.js`, `server/src/config.js`, `server/src/db/pool.js`, `server/src/routes/shortLinks.js`, `server/src/services/shortLinksService.js`, `server/src/validation/shortLinks.js`, `server/src/errors.js`, `server/migrations/001_create_short_links.sql`, `server/test/shortLinks.test.js`, `server/.env.example`
  - Modified: `package.json`, `.gitignore`
  - Removed: none
- External systems: Supabase PostgreSQL pooled database connection
- Dependencies: Express, pg, and backend test tooling
