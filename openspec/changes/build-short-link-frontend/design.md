## Context

現有 Vue 3/Vite 專案只有空白 App 元件與最小全域 CSS。此階段要先交付可供產品確認的前端介面，後端 API 尚不存在，因此必須讓 UI 流程可獨立演示，同時保留日後串接 Express 的單一替換點。

## Goals / Non-Goals

**Goals:**

- 建立桌面與手機皆可操作的短網址首頁。
- 明確拆分頁面組裝、表單、結果、驗證、API adapter 與全域樣式責任。
- 提供原始網址與自訂短碼的即時可理解驗證。
- 以 mock adapter 完成提交、結果呈現與一鍵複製的完整操作示範。
- 使用自動化測試與 Vite production build 驗證核心行為。

**Non-Goals:**

- 不建立 Express、PostgreSQL、Supabase 或部署設定。
- 不實作真實短碼唯一性查詢、轉址、點擊計數或 404 路由。
- 不加入登入、歷史清單、編輯、刪除或統計頁。
- 不在 Vue 元件中直接存取 Supabase 或硬編寫未來的後端資料庫契約。

## Decisions

### Feature-oriented frontend ownership

`HomeView` 負責頁面編排，`ShortLinkForm` 只負責輸入與送出，`ShortLinkResult` 只負責結果與複製，`validators` 提供純函式驗證，`shortLinksApi` 是唯一建立短網址的資料來源。相較把所有內容放進 `App.vue`，此結構能維持固定歸屬並讓後端串接只更換 adapter。

### Predictable mock API boundary

`createShortLink(payload)` 回傳 Promise，成功資料固定包含 `originalUrl`、`shortCode`、`shortUrl` 與 `clickCount`。未填短碼時以可預測的 `q7X2k9P` 示範，不在此階段模擬碰撞或網路錯誤。相較在元件中使用 timeout，集中 adapter 能避免將暫時行為散落到畫面層。

### Validation as pure functions

`validateOriginalUrl` 僅接受完整 HTTP/HTTPS URL；`validateShortCode` 接受空值或 3–32 位英數字、連字號、底線。表單提交時統一呼叫這些函式，錯誤顯示於對應欄位並阻止 adapter 呼叫。

### Accessible responsive product page

頁面採高對比文字、清楚 focus 狀態、語意化 label、aria-live 狀態與可觸控的大型控制項。版面在窄螢幕改為單欄，結果網址允許換行，避免水平溢出。

### Lightweight automated verification

加入 Vitest 與 Vue Test Utils，測試驗證邊界、表單錯誤、成功結果及複製狀態；另以 Vite production build 驗證可部署輸出。此階段不加入瀏覽器端 E2E 工具，避免為單頁 mock 流程引入過重依賴。

## Implementation Contract

### Observable behavior

- 首頁顯示產品標題、用途說明、原始網址欄位、自訂短碼選填欄位與建立按鈕。
- 原始網址為空、缺少 HTTP/HTTPS 協定或使用其他協定時，對應欄位顯示錯誤且不建立結果。
- 自訂短碼空白時視為合法；非空值不符合 3–32 位 `[A-Za-z0-9_-]` 時顯示錯誤。
- 合法提交期間按鈕顯示處理狀態並停用；完成後顯示原始網址、短網址、初始點擊數 0 與複製按鈕。
- 複製成功後按鈕文字短暫變為「已複製」並透過 aria-live 宣告；Clipboard API 失敗時顯示可理解錯誤。

### Interface and data shape

- `createShortLink({ originalUrl, customCode })` 回傳 Promise，解析為 `{ originalUrl, shortCode, shortUrl, clickCount }`。
- `validateOriginalUrl(value)` 與 `validateShortCode(value)` 各回傳空字串代表合法，否則回傳可直接顯示的繁體中文錯誤訊息。
- 表單以 `submit` event 傳出建立請求；頁面組裝層呼叫 adapter 並把成功資料傳給結果元件。

### Failure modes

- 欄位驗證失敗必須留在表單層並聚焦第一個錯誤欄位。
- adapter 拒絕時頁面顯示一般建立失敗訊息，保留使用者輸入以便重試。
- Clipboard API 不存在或拒絕時不得顯示成功狀態，結果卡片顯示複製失敗訊息。

### Acceptance criteria

- `npm test` 通過驗證工具與元件互動測試。
- `npm run build` 完成且無編譯錯誤。
- 手動以桌面與手機寬度確認表單、結果卡片、錯誤訊息與 focus 狀態沒有溢出或遮蔽。

### Scope boundaries

- In scope: Vue 畫面、前端驗證、mock adapter、Clipboard API 互動、自動化前端測試與響應式樣式。
- Out of scope: 真實網路請求、資料持久化、短碼重複回應、轉址、點擊追蹤、後端 404 與正式部署。

## Risks / Trade-offs

- [Risk] Mock 短網址網域與後端實際網域不同 → 將 base URL 集中在 API adapter，後端階段只替換該模組。
- [Risk] Clipboard API 在非安全來源不可用 → 明確顯示失敗訊息，開發驗收同時涵蓋成功與失敗狀態。
- [Risk] 過早確定視覺方向造成返工 → 將視覺 token 集中於全域 CSS 變數，元件保留語意化 class。
