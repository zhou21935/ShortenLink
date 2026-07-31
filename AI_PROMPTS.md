# AI 協作 Prompt 紀錄

## 1. 規劃專案架構

**Prompt：**

> 請協助規劃一個縮網址網站的技術架構。  
> 網站需要讓使用者輸入原始網址並產生短網址，也需要支援短網址重新導向。  
> 請規劃前端、後端、資料庫之間的分工與開發順序。

**實作結果：**

- 前端使用 Vue 3 與 Vite。
- 後端使用 Node.js 與 Express。
- 使用 PostgreSQL 儲存短碼與原始網址。
- 將前端、後端、資料庫與部署工作分階段完成。

## 2. 實作縮網址前端

**Prompt：**

> 請使用 Vue 3 實作縮網址頁面。  
> 使用者可以輸入 HTTP 或 HTTPS 網址，並可選擇填寫自訂短碼。  
> 送出後需要顯示產生的短網址，並提供複製功能。  
> 請處理載入中、成功、輸入錯誤與 API 錯誤狀態，介面需支援手機與桌面尺寸。

**實作結果：**

- 建立網址與自訂短碼輸入欄位。
- 加入表單送出、結果顯示與短網址複製功能。
- 加入 loading、成功與錯誤提示。
- 調整響應式版面與介面配色。

## 3. 實作後端 API

**Prompt：**

> 請使用 Node.js 與 Express 實作縮網址後端 API。  
> API 需要建立短網址、產生隨機短碼、接受自訂短碼，並檢查短碼是否重複。  
> 使用者開啟短網址時，伺服器需要以 HTTP 302 導向原始網址。  
> 請處理網址格式錯誤、短碼衝突、短碼不存在與伺服器錯誤。

**實作結果：**

- 建立短網址 API。
- 僅接受 HTTP 與 HTTPS 網址。
- 支援隨機短碼與自訂短碼。
- 短碼重複時回傳衝突錯誤。
- 使用 HTTP 302 執行重新導向。
- 對不存在的短碼及服務異常提供錯誤回應。

## 4. 建立 PostgreSQL 資料庫

**Prompt：**

> 請為縮網址服務設計 PostgreSQL 資料表與 migration。  
> 資料表需要包含短碼、原始網址與建立時間。  
> Migration 必須可以安全重複執行，並在執行失敗時 rollback。  
> 資料庫連線資訊必須由環境變數提供，不可以寫死在程式碼中。

**實作結果：**

- 使用 PostgreSQL 儲存短網址資料。
- 建立短網址資料表 migration。
- 使用 transaction 避免只完成部分 schema 變更。
- 資料庫連線字串由 `DATABASE_URL` 提供。
- 正式環境使用 Supabase PostgreSQL。

## 5. 串接前端與後端

**Prompt：**

> 請將 Vue 前端串接 Express 縮網址 API。  
> 使用者送出網址後，前端需要呼叫 API 並顯示產生的短網址。  
> 請處理 API 成功、輸入錯誤、自訂短碼衝突、網路錯誤與伺服器錯誤。

**實作結果：**

- 前端透過 API 建立短網址。
- 將後端錯誤轉換成使用者可理解的提示。
- 成功建立後顯示完整短網址。
- 保留自訂短碼與複製短網址功能。

**手動測試確認：**

- 使用自訂短碼建立短網址，確認產生結果符合輸入值。
- 重複使用相同自訂短碼，確認前端顯示短碼衝突提示。
- 開啟產生的短網址，確認可以正確導向原始網址。

## 6. 建立自動化測試

**Prompt：**

> 請替縮網址專案補上自動化測試。  
> 測試需要涵蓋網址驗證、短網址建立、自訂短碼衝突、短網址 redirect、資料庫錯誤與 health check。  
> 前端也需要測試表單操作、API 成功與錯誤狀態。

**實作結果：**

- 使用 Vitest 測試前端功能。
- 使用 Node.js test runner 與 Supertest 測試後端 API。
- 使用 pg-mem 測試資料庫相關行為。
- 涵蓋正常流程、輸入錯誤、短碼衝突與服務異常。

## 7. 建立 CI

**Prompt：**

> 請為專案建立 GitHub Actions。  
> 在 push 與 pull request 時安裝前後端依賴、執行完整測試，並驗證 Vue production build。  
> 安裝依賴時需要使用 lockfile，避免 CI 與本機使用不同套件版本。

**實作結果：**

- GitHub Actions 會執行前端與後端測試。
- CI 會驗證 production build。
- 使用 lockfile 安裝固定版本的依賴。
- 根據 CI 執行結果調整 Node.js 版本與環境設定。

## 8. 設定 Production 執行方式

**Prompt：**

> 請規劃縮網址網站的 production 執行方式。  
> 使用同一個 Express process 提供 Vue 靜態檔案、API 與短網址 redirect。  
> 請加入資料庫 health check，並將 migration、build 與 production start 拆成明確指令。  
> 專案需要可以部署到 Render，並連接 Supabase PostgreSQL。

**實作結果：**

- Express 提供 Vue production build。
- 前端、API 與 redirect 使用同一個 origin。
- 加入資料庫 readiness health check。
- 將 migration、build 與 production start 拆成獨立指令。
- 使用 Render 部署服務。
- 使用環境變數設定公開網址、資料庫連線與服務連接埠。

**手動測試確認：**

- 開啟 Render 線上網站，確認前端頁面可以正常載入。
- 在線上環境建立短網址，並確認資料成功寫入 Supabase PostgreSQL。
- 重新部署 Render 服務後，確認原有短網址仍然有效。
- 使用手機實機操作線上網站，確認縮網址主要流程與版面顯示正常。
