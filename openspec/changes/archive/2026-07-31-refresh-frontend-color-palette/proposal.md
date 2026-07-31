## Summary

以指定的五色暖粉黃配色重新整理短網址前端介面，使背景、容器、主要操作與狀態提示形成一致且清楚的視覺層級。

## Motivation

目前介面仍使用藍、綠與米白等分散色彩，與指定品牌色票不一致；集中使用新色票可提升整體一致性，同時保留文字與控制項的可讀性。

## Proposed Solution

- 將 #F7EDF0、#F4CBC6、#F4AFAB、#F4EEA9、#F4F482 定義為共用色彩變數。
- 以淡粉作頁面背景與卡片表面、深粉作主要操作與焦點、淡黃與亮黃作結果及互動強調。
- 保留深色文字與錯誤色，確保內容與狀態仍易辨識。

## Non-Goals

- 不調整版面、元件結構、文案、API 或表單行為。
- 不新增深色模式或主題切換功能。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- short-link-frontend: 新增指定五色票的視覺主題要求，並維持鍵盤焦點與內容可讀性。

## Impact

- Affected specs: short-link-frontend
- Affected code:
  - Modified: src/styles/main.css
  - New: none
  - Removed: none
