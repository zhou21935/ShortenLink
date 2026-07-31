# ShortenLink

[![CI](https://github.com/zhou21935/ShortenLink/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/zhou21935/ShortenLink/actions/workflows/ci.yml)

使用 Vue、Express 與 PostgreSQL 打造的短網址服務。前後端由同一個 Render Web Service 提供，資料儲存在 Supabase PostgreSQL。

**線上 Demo：** https://shortenlink-2plb.onrender.com/

## 功能

- 將 HTTP／HTTPS 網址轉換為短網址
- 支援自訂短碼
- 短網址以 HTTP 302 導向原始網址
- 資料庫 readiness health check
- 可重複執行且具 transaction rollback 的 migration
- 單一 Express process 提供前端、API 與 redirect

## 技術棧

| 領域 | 技術 |
| --- | --- |
| 前端 | Vue 3、Vite、Vitest |
| 後端 | Node.js、Express |
| 資料庫 | PostgreSQL、Supabase |
| 測試 | Vitest、Node.js test runner、Supertest、pg-mem |
| 部署 | Render |
| CI | GitHub Actions |

## 架構

```text
Browser
   │
   ▼
Render / Express
   ├── Vue production build
   ├── /api/short-links
   ├── /api/health
   └── /:shortCode
            │
            ▼
      Supabase PostgreSQL
```

Production 使用單一 origin，避免額外的 CORS 與前後端網址設定。Express 先處理 API 與靜態資源，再處理短碼 redirect。

## 本機啟動

需求：Node.js 24+、可連線的 PostgreSQL 資料庫。

```powershell
npm install
npm --prefix server install
Copy-Item server\.env.example server\.env
```

編輯 `server/.env`：

```env
DATABASE_URL=postgresql://user:password@host:5432/postgres
PUBLIC_BASE_URL=http://localhost:3000
PORT=3000
```

範例值不是真實 credentials。`server/.env` 已被 Git 忽略，請勿提交任何資料庫密碼或連線字串。

執行 migration 並啟動前後端：

```powershell
npm run db:migrate
npm run dev:all
```

前端預設為 `http://localhost:5173`，後端與 health check 預設為 `http://localhost:3000/api/health`。

## 測試與建置

```powershell
npm test
npm run build
```

GitHub Actions 會在 push 與 pull request 時使用 lockfile 安裝前後端依賴，執行完整測試並驗證 production build。

## Production

```powershell
npm run db:migrate
npm run build
npm run start:production
```

Production 必須設定 `DATABASE_URL`、`PUBLIC_BASE_URL` 與平台提供的 `PORT`。`start:production` 不會自動 build 或 migrate，啟動前必須已有 `dist/index.html`。

目前部署方式：

- Render 建置：`npm install && npm --prefix server install && npm run build`
- Render 啟動：`npm run start:production`
- Render health check：`/api/health`
- Supabase：外部 PostgreSQL，透過 `DATABASE_URL` 連線

## API

建立短網址：

```http
POST /api/short-links
Content-Type: application/json

{
  originalUrl: https://example.com,
  customCode: demo123
}
```

成功回傳 HTTP 201；瀏覽 `/:shortCode` 時回傳 HTTP 302。`GET /api/health` 在資料庫可用時回傳：

```json
{status:ok}
```

## 設計取捨

- 短碼服務保持無登入，適合作品展示與小規模使用；公開營運前仍需補上 rate limiting、濫用防護與管理功能。
- migration 由明確指令執行，避免應用程式啟動時意外修改 production schema。
- credentials 僅由本機 `.env` 或部署平台環境變數提供，不進入 Git。
