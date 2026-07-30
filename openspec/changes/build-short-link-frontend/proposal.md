## Why

目前 Vue 專案只有空白頁面，無法讓使用者確認短網址服務的操作流程與視覺方向。先完成可互動的前端介面，能在後端串接前確認輸入、驗證、結果與複製體驗。

## What Changes

- 建立響應式短網址首頁，清楚呈現產品用途與主要操作區。
- 提供原始網址必填欄位與自訂短碼選填欄位。
- 在前端驗證完整 HTTP/HTTPS 網址，以及 3–32 位英數字、連字號或底線組成的自訂短碼。
- 使用獨立 API adapter；在後端尚未提供時，以可預測的 mock 結果呈現成功狀態。
- 建立成功結果卡片、一鍵複製回饋、載入狀態與可理解的錯誤訊息。
- 依固定目錄責任拆分 view、components、api、utils 與 styles，避免跨層邏輯散落。

## Capabilities

### New Capabilities

- `short-link-frontend`: 短網址建立表單、前端驗證、模擬建立結果與一鍵複製互動。

### Modified Capabilities

(none)

## Impact

- Affected specs: short-link-frontend
- Affected code:
  - New: src/views/HomeView.vue, src/components/ShortLinkForm.vue, src/components/ShortLinkResult.vue, src/api/shortLinksApi.js, src/utils/validators.js, src/styles/main.css
  - Modified: src/App.vue, src/main.js, package.json, package-lock.json, vite.config.js
  - Removed: src/style.css
- External systems: 本階段不連接 Express、Supabase、Render 或 Vercel。
