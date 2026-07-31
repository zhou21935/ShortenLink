## 1. 作品呈現

- [x] 1.1 在 README.md 完成 Interview project overview，提供正式 Demo、功能、技術棧、架構、本機操作、測試與部署資訊，並完成 Visible CI status 徽章；以內容檢查確認連結與指令正確，且不含真實 credentials。

## 2. 自動化品質門檻

- [x] 2.1 在 .github/workflows/ci.yml 建立 Automated repository quality gate，讓 push 與 pull_request 使用 npm ci 安裝根目錄及 server 依賴後依序執行 npm test 與 npm run build；以本機 npm test、npm run build 與 workflow YAML 檢查驗證。
- [x] 2.2 執行 spectra analyze improve-interview-readiness --json、spectra validate improve-interview-readiness、git diff --check 與 git status --short，確認 artifacts、文件與 CI 設定一致且無格式錯誤。
