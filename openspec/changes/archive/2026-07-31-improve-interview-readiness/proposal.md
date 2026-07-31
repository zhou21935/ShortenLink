## Why

目前專案已可公開使用與部署，但 GitHub 首頁尚未以面試官可快速理解的方式呈現線上成果、架構與驗證方式，也缺少每次推送自動執行測試與建置的品質門檻。補齊作品展示與 CI 可降低審查成本，並提供可重複的正確性證據。

## What Changes

- 重整 README，使首頁清楚提供線上 Demo、功能摘要、技術棧、架構、操作流程、本機啟動、測試與部署資訊。
- 新增 GitHub Actions workflow，在 push 與 pull request 時安裝前後端依賴、執行完整測試並驗證 production build。
- 在 README 顯示 CI 狀態徽章，讓面試官能直接確認最新品質狀態。

## Non-Goals

- 不新增短網址產品功能、登入驗證、限流或管理介面。
- 不變更 Render 或 Supabase 的既有正式環境資源。
- 不把任何秘密值寫入 README、workflow 或 Git 追蹤檔案。

## Capabilities

### New Capabilities

- `project-quality-presentation`: 定義公開作品說明與自動化 CI 品質門檻。

### Modified Capabilities

（無）

## Impact

- Affected specs: project-quality-presentation
- Affected code:
  - New: .github/workflows/ci.yml
  - Modified: README.md
  - Removed: none
