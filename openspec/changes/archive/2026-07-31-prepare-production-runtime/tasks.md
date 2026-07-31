## 1. 環境與資料庫準備

- [x] 1.1 實作「環境變數優先於本機 env file」與 `Deterministic environment loading`：以 module-relative `server/.env` 載入選填本機值、不覆蓋 process environment、缺少必填值時不輸出 secrets，並更新 `.gitignore`、`server/.env.example`、dependency lockfiles；以 `server/test/runtime.test.js` 驗證優先權、跨 working directory 載入與缺值失敗。
- [x] 1.2 實作「Migration CLI 以單一 transaction 執行既有 SQL」與 `Repeatable database migration command`：`npm run db:migrate` 依序執行 `BEGIN`、migration SQL、`COMMIT`，失敗執行 `ROLLBACK`、關閉 pool、回傳非零且不輸出連線字串；以可注入 pool 的 `server/test/runtime.test.js` 驗證成功、重跑、rollback 與 cleanup。

## 2. Production HTTP runtime

- [x] 2.1 實作「Readiness endpoint 查詢 PostgreSQL」與 `Database readiness endpoint`：`GET /api/health` 對成功 healthCheck 回傳 200 `{ "status": "ok" }`，拒絕時回傳 503 `{ "status": "unavailable" }` 且遮蔽 error details；以 `server/test/backend.test.js` 覆蓋兩種結果並確認既有 API routes 不變。
- [x] 2.2 實作「Production 單一 origin 與靜態路由順序」及 `Single-process production HTTP runtime`：production 服務 root `dist`、assets、API 與 `/:shortCode`，缺少 `dist/index.html` 時在 listen 前失敗；以 temporary build fixture 的 `server/test/runtime.test.js` 驗證首頁、asset、API route precedence、redirect 與 missing-build failure。

## 3. 操作介面與驗收

- [x] 3.1 實作「Root scripts 與操作文件是部署前介面」及 `Deployment-preparation operator workflow`：新增 `dev:all`、`db:migrate`、`start:production` scripts 與 `README.md`，明列 install、假值 env、Supabase migration、build、start、health、create/redirect smoke test、rollback preparation，且不包含真實 secrets 或實際部署動作；以 script inspection、README content test 與 `npm run build` 驗證。
- [x] 3.2 依 `Implementation Contract` 執行 runtime tests、完整 `npm test`、`npm run build`、`spectra analyze prepare-production-runtime --json`、`spectra validate prepare-production-runtime`、Git secret pattern scan 與 server scope review，確認所有命令、failure modes 與部署延後界線通過後再標記完成。
