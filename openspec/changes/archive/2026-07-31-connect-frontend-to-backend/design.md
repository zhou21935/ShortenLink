## Context

前端目前由 `createShortLink` 回傳固定 mock 結果；HomeView 已具備 pending、result、requestError 與可注入 `createLink` 的測試邊界。後端已提供 `POST /api/short-links`，成功回傳 `{ originalUrl, shortCode, shortUrl, clickCount }`，失敗回傳 `{ error: { code, message } }`。串接必須維持現有表單驗證、重複送出防護與無障礙錯誤區域。

## Goals / Non-Goals

**Goals:**

- 讓預設前端流程透過同源 `/api/short-links` 建立真實短網址。
- 將 HTTP 非成功狀態轉為含穩定 `code` 的 adapter error，供頁面顯示針對性繁體中文訊息。
- 保留 adapter 注入，使元件測試不依賴啟動後端。
- 以 Vite `/api` proxy 支援本機前後端分離執行。

**Non-Goals:**

- 不新增短網址歷史列表、登入、刪除或編輯功能。
- 不改變 Express API、資料庫 schema、redirect 行為或部署拓撲。
- 不讓瀏覽器直接連線 PostgreSQL 或持有資料庫憑證。
- 不在此次變更加入 production reverse proxy；production 由部署環境提供同源 `/api` routing。

## Decisions

### 使用同源相對 API 路徑與 Vite 開發代理

`createShortLink` 固定呼叫 `/api/short-links`，不在前端 bundle 放置後端絕對 URL。Vite 開發環境將 `/api` proxy 至 `http://127.0.0.1:3000`，保留路徑且不改寫。這避免本機 CORS 設定與 production URL 分支。替代方案是 `VITE_API_BASE_URL`，但單一同源部署契約不需要擴大設定與測試面。

### Adapter 驗證 HTTP 與 JSON 契約

adapter 使用 `fetch`、JSON request header 與 `JSON.stringify` body。空白 `customCode` 不送出該欄位；成功時回傳後端 result。非 2xx 時解析 `error.code` 與 `error.message` 並拋出 `ShortLinkApiError`；無效 JSON、網路拒絕或缺少穩定錯誤物件時統一為 `NETWORK_ERROR` 或 `UNKNOWN_ERROR`，不把伺服器內部文字直接呈現在 UI。

### 頁面依錯誤代碼映射使用者訊息

HomeView 對 `SHORT_CODE_CONFLICT` 顯示「此短碼已被使用，請換一組」、對輸入錯誤提示重新檢查、對 `SHORT_CODE_GENERATION_FAILED` 提示稍後重試，其餘錯誤保留通用訊息。每次提交先清除舊錯誤；失敗不覆寫既有成功 result。

### 保留 createLink 注入邊界

HomeView 繼續以 prop 注入 adapter，production default 使用真實 `createShortLink`。adapter 測試 mock `global.fetch` 驗證 wire contract；頁面測試注入 resolved/rejected function 驗證 UI state，不啟動 TCP service。

## Implementation Contract

- Behavior: 有效表單提交後，畫面在 pending 期間停用提交，向 `/api/short-links` 發出一次 POST，成功後顯示後端回傳的 `shortUrl`、`originalUrl` 與數值 `clickCount`；pending 期間不得產生第二次呼叫。
- Interface: `createShortLink({ originalUrl, customCode })` 回傳 Promise，request 使用 `Content-Type: application/json`。有值的 custom code body 包含 `originalUrl` 與 `customCode`，空值 body 僅含 `originalUrl`。成功 response 符合 `{ originalUrl: string, shortCode: string, shortUrl: string, clickCount: number }`。
- Failure modes: HTTP error 轉為 `ShortLinkApiError` 並公開安全的 `code` 與 `message`；網路拒絕使用 `NETWORK_ERROR`；無法辨識的 response 使用 `UNKNOWN_ERROR`。未知錯誤顯示「目前無法建立短網址，請稍後再試」。失敗時 pending 恢復 false，既有 result 保留。
- Development routing: Vite dev server 的 `/api` 請求 proxy 至 `http://127.0.0.1:3000`，production build 不內嵌 localhost URL。
- Acceptance criteria: `npm test -- src/api/shortLinksApi.spec.js src/views/HomeView.spec.js`、完整 `npm test`、`npm run build`、`spectra analyze connect-frontend-to-backend --json` 與 `spectra validate connect-frontend-to-backend` 全部通過。
- In scope: adapter transport、error classification、HomeView error mapping、Vite dev proxy 與對應測試。
- Out of scope: 後端 route/schema 修改、production proxy provisioning、authentication、history UI 與資料庫 migration。

## Risks / Trade-offs

- [本機後端未啟動時請求失敗] → adapter 將 fetch rejection 映射為通用可恢復錯誤，頁面解除 pending。
- [後端回傳非預期 JSON] → adapter 不信任任意 response text，改用 `UNKNOWN_ERROR`。
- [production routing 尚未配置] → production 環境必須將 `/api` 路由至 Express；本變更只提供 Vite 開發代理。
- [前後端 validation 訊息可能不同] → 前端提供即時驗證，後端仍是最終權威。
