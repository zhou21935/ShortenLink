## 1. 測試與模組基礎

- [x] 1.1 建立 Lightweight automated verification：設定 Vitest、Vue Test Utils 與 jsdom，使 `npm test` 能執行 `src/**/*.spec.js`，並以一個可通過的 smoke test 驗證測試環境。
- [x] 1.2 建立 Validation as pure functions：實作 `validateOriginalUrl` 與 `validateShortCode` 的明確中文錯誤契約，涵蓋 Original URL validation 與 Custom short code validation 規格範例；以 `src/utils/validators.spec.js` 全數通過驗證。
- [x] 1.3 建立 Predictable mock API boundary：實作 `createShortLink({ originalUrl, customCode })` 的 Promise 與固定結果資料形狀，涵蓋 Mock creation lifecycle 的自訂及自動短碼案例；以 adapter 單元測試確認輸出。

## 2. 使用者介面與互動

- [x] 2.1 建立 Feature-oriented frontend ownership：由 `ShortLinkForm.vue` 提供 Short link creation form、欄位錯誤、第一個錯誤聚焦及 pending 防重送行為，由元件測試確認無效輸入不送出、有效輸入只送出一次。
- [x] 2.2 建立 `ShortLinkResult.vue` 的 Copy short URL 行為：顯示短網址、原始網址及點擊數，Clipboard API 成功時顯示「已複製」、失敗時保留結果並顯示手動複製提示；以元件測試覆蓋兩條路徑。
- [x] 2.3 建立 Accessible responsive product page：由 `HomeView.vue` 組裝表單、mock adapter 與結果狀態，`App.vue` 保持入口責任，並以元件整合測試確認合法提交產生 `https://sho.rt/news_2026` 及 adapter 拒絕時保留輸入並顯示錯誤。

## 3. 視覺與交付驗證

- [x] 3.1 完成 Responsive and accessible presentation：集中全域 token 與版面樣式至 `src/styles/main.css`，在 375px 與桌面寬度維持單欄切換、長網址換行、label、aria-live 與可見 focus；以瀏覽器手動檢查兩種寬度與鍵盤操作。
- [x] 3.2 依 Observable behavior、Interface and data shape、Failure modes、Acceptance criteria 與 Scope boundaries 執行完整驗證：`npm test` 與 `npm run build` 必須成功，並手動確認初始、欄位錯誤、處理中、成功結果、複製成功及複製失敗狀態均符合 Implementation Contract，且未加入任何後端或部署功能。

