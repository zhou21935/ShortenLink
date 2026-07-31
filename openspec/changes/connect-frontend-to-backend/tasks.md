## 1. API adapter 契約

- [x] 1.1 實作「使用同源相對 API 路徑與 Vite 開發代理」及「Adapter 驗證 HTTP 與 JSON 契約」：讓 `createShortLink({ originalUrl, customCode })` 對 `/api/short-links` 發出 JSON POST、空白短碼不送出 `customCode`、成功回傳後端資料，並以 `src/api/shortLinksApi.spec.js` 驗證有／無自訂碼的 request shape 與 response passthrough。（對應「Backend creation lifecycle」）
- [x] 1.2 建立 `ShortLinkApiError` failure contract：將穩定後端 error JSON、網路拒絕與未知 response 分類且不洩漏 raw 內部內容，並以 `src/api/shortLinksApi.spec.js` 驗證 `SHORT_CODE_CONFLICT`、`NETWORK_ERROR`、`UNKNOWN_ERROR`。（對應「Adapter 驗證 HTTP 與 JSON 契約」與「Backend creation error feedback」）

## 2. 頁面串接狀態

- [x] 2.1 實作「頁面依錯誤代碼映射使用者訊息」與「保留 createLink 注入邊界」：移除「Mock creation lifecycle」固定結果，成功顯示真實後端 result、已知 error code 顯示指定繁體中文回饋、未知錯誤顯示安全通用訊息、失敗解除 pending 且保留既有 result，並以 `src/views/HomeView.spec.js` 驗證成功、衝突、產碼失敗、未知失敗與重複提交。（對應「Backend creation lifecycle」及「Backend creation error feedback」）

## 3. 開發路由與整體驗收

- [x] 3.1 在 `vite.config.js` 完成 `/api` 至 `http://127.0.0.1:3000` 的「使用同源相對 API 路徑與 Vite 開發代理」，確認 production build 不內嵌 localhost，並以 `npm run build` 及 config review 驗證。
- [x] 3.2 依「Implementation Contract」執行 `npm test`、`npm run build`、`spectra analyze connect-frontend-to-backend --json` 與 `spectra validate connect-frontend-to-backend`，確認 adapter transport、錯誤分類、HomeView 狀態與 Vite proxy 全部通過且未修改後端 route、database schema 或 redirect 行為。
