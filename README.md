# ShortenLink

Vue + Express + PostgreSQL 的短網址服務。本文件只涵蓋部署前準備，不會建立或部署任何雲端資源。

## 安裝與環境

```sh
npm install
npm --prefix server install
copy server\.env.example server\.env
```

編輯 `server/.env`，填入已建立的 PostgreSQL（例如 Supabase）連線 URL 與公開網址。範例值是假值，請勿提交 `.env` 或任何 secret。

## 資料庫與本機開發

先在 Supabase 建立資料庫並保存 rollback 前的備份/還原點，再執行 checked-in migration：

```sh
npm run db:migrate
npm run dev:all
```

migration 可重跑；失敗會 rollback 並回傳非零狀態。rollback 準備應包含資料備份、schema 快照與前一版應用程式版本，本專案不會自動破壞或回滾 production 資料。

## Production build 與啟動

```sh
npm run build
npm run start:production
```

`start:production` 不會偷偷 build 或 migrate。啟動前必須已有 `dist/index.html`。

## 驗收 smoke test

```sh
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/short-links -H "Content-Type: application/json" -d "{\"originalUrl\":\"https://example.com\",\"customCode\":\"demo123\"}"
curl -I http://localhost:3000/demo123
```

health 應回傳 `{ "status": "ok" }`，建立請求應為 201，redirect 應為 302。完成以上部署前驗收後，再獨立選擇 hosting、DNS/TLS 與 CI/CD；本變更不執行實際部署。
