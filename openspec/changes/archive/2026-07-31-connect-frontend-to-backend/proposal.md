## Why

目前前端建立短網址流程仍回傳固定 mock 資料，無法將使用者輸入送到已完成的 Express/PostgreSQL 後端。現在需要接上真實 API，讓建立結果、短碼衝突與服務失敗都反映後端的實際狀態。

## What Changes

- 將前端建立 adapter 改為呼叫 `POST /api/short-links`，傳送 `originalUrl` 與選填 `customCode`，並回傳後端 JSON 結果。
- 依後端穩定錯誤契約區分自訂短碼衝突、輸入錯誤、短碼產生失敗與一般服務錯誤，提供可理解的前端回饋。
- 保留 HomeView 的 adapter 注入邊界，避免 UI 測試依賴網路。
- 設定 Vite 開發代理，讓本機前端以同源 `/api` 路徑連到 Express 服務。
- 以 adapter 與頁面測試覆蓋請求形狀、成功結果、錯誤映射、重複送出防護及重新提交狀態。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `short-link-frontend`: 將 mock 建立生命週期改為真實後端 API 串接，並定義後端錯誤在前端的可觀察回饋。

## Impact

- Affected specs: short-link-frontend
- Affected code:
  - New: (none)
  - Modified: src/api/shortLinksApi.js, src/api/shortLinksApi.spec.js, src/views/HomeView.vue, src/views/HomeView.spec.js, vite.config.js
  - Removed: (none)
- External interface: POST /api/short-links
- Dependencies: no new runtime dependencies
