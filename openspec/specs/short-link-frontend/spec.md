# short-link-frontend Specification

## Purpose

TBD - created by archiving change 'build-short-link-frontend'. Update Purpose after archive.

## Requirements

### Requirement: Short link creation form
The frontend SHALL present a required original URL field, an optional custom short code field, and a submit control on the primary page.

#### Scenario: Initial form presentation
- **WHEN** a visitor opens the primary page
- **THEN** the visitor sees both labeled fields and a control for creating a short link


<!-- @trace
source: build-short-link-frontend
updated: 2026-07-31
code:
  - package.json
  - src/components/ShortLinkResult.vue
  - src/views/HomeView.vue
  - src/api/shortLinksApi.js
  - src/utils/validators.js
  - src/main.js
  - src/components/ShortLinkForm.vue
  - src/style.css
  - src/App.vue
  - vite.config.js
  - src/styles/main.css
tests:
  - src/components/ShortLinkResult.spec.js
  - src/App.spec.js
  - src/utils/validators.spec.js
  - src/views/HomeView.spec.js
  - src/api/shortLinksApi.spec.js
  - src/components/ShortLinkForm.spec.js
-->

---
### Requirement: Original URL validation
The frontend MUST accept only complete URLs using the HTTP or HTTPS protocol and MUST display a field-level error for missing, incomplete, or unsupported URLs.

#### Scenario: Validate original URL boundaries
- **WHEN** a visitor submits the form with an original URL value
- **THEN** the frontend accepts only values represented as valid in the example table and prevents submission for all invalid values

##### Example: Original URL cases

| Input | Expected Output | Notes |
| ----- | --------------- | ----- |
| `https://example.com/article` | valid | HTTPS URL |
| `http://example.com` | valid | HTTP URL |
| `example.com` | error: 請輸入包含 http:// 或 https:// 的完整網址 | missing protocol |
| `ftp://example.com` | error: 網址僅支援 http:// 或 https:// | unsupported protocol |
| empty value | error: 請輸入原始網址 | required value |


<!-- @trace
source: build-short-link-frontend
updated: 2026-07-31
code:
  - package.json
  - src/components/ShortLinkResult.vue
  - src/views/HomeView.vue
  - src/api/shortLinksApi.js
  - src/utils/validators.js
  - src/main.js
  - src/components/ShortLinkForm.vue
  - src/style.css
  - src/App.vue
  - vite.config.js
  - src/styles/main.css
tests:
  - src/components/ShortLinkResult.spec.js
  - src/App.spec.js
  - src/utils/validators.spec.js
  - src/views/HomeView.spec.js
  - src/api/shortLinksApi.spec.js
  - src/components/ShortLinkForm.spec.js
-->

---
### Requirement: Custom short code validation
The frontend SHALL accept an empty custom code or a value containing 3 through 32 ASCII letters, digits, hyphens, or underscores, and SHALL reject every other value with a field-level error.

#### Scenario: Validate custom code boundaries
- **WHEN** a visitor enters a custom code
- **THEN** the frontend applies the exact validity outcomes in the example table

##### Example: Custom code cases

| Input | Expected Output | Notes |
| ----- | --------------- | ----- |
| empty value | valid | automatic code requested |
| `abc` | valid | minimum length |
| `news_2026` | valid | underscore allowed |
| `my-link` | valid | hyphen allowed |
| `ab` | error: 短碼需為 3–32 位英數字、連字號或底線 | too short |
| `a/b` | error: 短碼需為 3–32 位英數字、連字號或底線 | forbidden slash |


<!-- @trace
source: build-short-link-frontend
updated: 2026-07-31
code:
  - package.json
  - src/components/ShortLinkResult.vue
  - src/views/HomeView.vue
  - src/api/shortLinksApi.js
  - src/utils/validators.js
  - src/main.js
  - src/components/ShortLinkForm.vue
  - src/style.css
  - src/App.vue
  - vite.config.js
  - src/styles/main.css
tests:
  - src/components/ShortLinkResult.spec.js
  - src/App.spec.js
  - src/utils/validators.spec.js
  - src/views/HomeView.spec.js
  - src/api/shortLinksApi.spec.js
  - src/components/ShortLinkForm.spec.js
-->

---
### Requirement: Mock creation lifecycle
The frontend SHALL prevent duplicate submissions while creation is pending and SHALL render the mock result after a valid request resolves.

#### Scenario: Successful mock creation
- **WHEN** a visitor submits `https://example.com/article` with custom code `news_2026`
- **THEN** the submit control is disabled during processing and the result displays `https://sho.rt/news_2026`, the original URL, and click count `0`

#### Scenario: Automatic mock short code
- **WHEN** a visitor submits a valid original URL with an empty custom code
- **THEN** the result displays the mock short code `q7X2k9P`

#### Scenario: Validation blocks creation
- **WHEN** either field contains an invalid value and the visitor submits the form
- **THEN** the frontend does not call the creation adapter and focuses the first invalid field


<!-- @trace
source: build-short-link-frontend
updated: 2026-07-31
code:
  - package.json
  - src/components/ShortLinkResult.vue
  - src/views/HomeView.vue
  - src/api/shortLinksApi.js
  - src/utils/validators.js
  - src/main.js
  - src/components/ShortLinkForm.vue
  - src/style.css
  - src/App.vue
  - vite.config.js
  - src/styles/main.css
tests:
  - src/components/ShortLinkResult.spec.js
  - src/App.spec.js
  - src/utils/validators.spec.js
  - src/views/HomeView.spec.js
  - src/api/shortLinksApi.spec.js
  - src/components/ShortLinkForm.spec.js
-->

---
### Requirement: Copy short URL
The result SHALL provide a control that writes the displayed short URL to the Clipboard API and SHALL expose success or failure feedback.

#### Scenario: Successful copy
- **WHEN** the Clipboard API resolves after the visitor activates the copy control
- **THEN** the control displays `已複製` temporarily and an aria-live region announces success

#### Scenario: Failed copy
- **WHEN** the Clipboard API is unavailable or rejects the write operation
- **THEN** the result remains visible and displays `無法自動複製，請手動選取短網址`


<!-- @trace
source: build-short-link-frontend
updated: 2026-07-31
code:
  - package.json
  - src/components/ShortLinkResult.vue
  - src/views/HomeView.vue
  - src/api/shortLinksApi.js
  - src/utils/validators.js
  - src/main.js
  - src/components/ShortLinkForm.vue
  - src/style.css
  - src/App.vue
  - vite.config.js
  - src/styles/main.css
tests:
  - src/components/ShortLinkResult.spec.js
  - src/App.spec.js
  - src/utils/validators.spec.js
  - src/views/HomeView.spec.js
  - src/api/shortLinksApi.spec.js
  - src/components/ShortLinkForm.spec.js
-->

---
### Requirement: Responsive and accessible presentation
The frontend SHALL remain usable without horizontal overflow at mobile and desktop widths and MUST expose programmatic labels, visible keyboard focus, and live status announcements.

#### Scenario: Narrow viewport
- **WHEN** the viewport width is 375 pixels
- **THEN** form controls and result actions use a single-column layout and long URLs wrap within their container

#### Scenario: Keyboard operation
- **WHEN** a visitor navigates the page using only a keyboard
- **THEN** every interactive control receives a visible focus indicator and can be activated

<!-- @trace
source: build-short-link-frontend
updated: 2026-07-31
code:
  - package.json
  - src/components/ShortLinkResult.vue
  - src/views/HomeView.vue
  - src/api/shortLinksApi.js
  - src/utils/validators.js
  - src/main.js
  - src/components/ShortLinkForm.vue
  - src/style.css
  - src/App.vue
  - vite.config.js
  - src/styles/main.css
tests:
  - src/components/ShortLinkResult.spec.js
  - src/App.spec.js
  - src/utils/validators.spec.js
  - src/views/HomeView.spec.js
  - src/api/shortLinksApi.spec.js
  - src/components/ShortLinkForm.spec.js
-->