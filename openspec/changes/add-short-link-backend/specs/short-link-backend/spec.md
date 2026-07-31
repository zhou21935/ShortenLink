## ADDED Requirements

### Requirement: Backend configuration
The backend MUST require a PostgreSQL `DATABASE_URL` and an absolute HTTP or HTTPS `PUBLIC_BASE_URL`, and SHALL accept an optional `PORT` for the HTTP listener.

#### Scenario: Valid configuration
- **WHEN** the process starts with a valid PostgreSQL connection string and `PUBLIC_BASE_URL` set to `https://sho.rt`
- **THEN** the Express service starts and uses `https://sho.rt` as the origin of generated short URLs

#### Scenario: Missing required configuration
- **WHEN** the process starts without `DATABASE_URL` or with an invalid `PUBLIC_BASE_URL`
- **THEN** startup fails with a configuration error before accepting HTTP requests

### Requirement: Short link persistence
The backend SHALL persist short links in Supabase PostgreSQL with an identifier, original URL, unique short code, non-negative click count initialized to zero, and creation timestamp.

#### Scenario: Persist a new short link
- **WHEN** a valid short link creation request is accepted
- **THEN** exactly one row is stored with the submitted original URL, the selected short code, click count `0`, and a creation timestamp

#### Scenario: Database-enforced uniqueness
- **WHEN** concurrent inserts attempt to store the same short code
- **THEN** the PostgreSQL unique constraint permits exactly one stored row with that short code

### Requirement: Short link creation API
The backend SHALL expose `POST /api/short-links` accepting JSON fields `originalUrl` and optional `customCode`. An absent or empty `customCode` SHALL request automatic generation of a 7-character ASCII alphanumeric short code.

#### Scenario: Create with a custom short code
- **WHEN** the client posts `{ "originalUrl": "https://example.com/article", "customCode": "news_2026" }`
- **THEN** the backend responds with HTTP 201 and `{ "originalUrl": "https://example.com/article", "shortCode": "news_2026", "shortUrl": "https://sho.rt/news_2026", "clickCount": 0 }` when `PUBLIC_BASE_URL` is `https://sho.rt`

#### Scenario: Create with an automatically generated code
- **WHEN** the client posts a valid `originalUrl` without `customCode`
- **THEN** the backend stores and returns a 7-character short code matching `^[A-Za-z0-9]{7}$`

#### Scenario: Retry an automatically generated collision
- **WHEN** an automatically generated short code conflicts with an existing row
- **THEN** the backend generates another code and retries the insert up to a total of 5 insert attempts

#### Scenario: Exhaust automatic generation attempts
- **WHEN** all 5 automatic short-code insert attempts conflict
- **THEN** the backend responds with HTTP 503 and error code `SHORT_CODE_GENERATION_FAILED`

### Requirement: Creation input validation
The backend MUST accept only original URLs with the `http:` or `https:` protocol and MUST accept a custom code only when it matches `^[A-Za-z0-9_-]{3,32}$`. Invalid input MUST NOT cause a database write.

#### Scenario: Validate creation boundaries
- **WHEN** the client submits a creation request
- **THEN** the backend produces the outcome defined by the following examples

##### Example: URL and custom-code cases

| originalUrl | customCode | Expected Output | Notes |
| --- | --- | --- | --- |
| `https://example.com/article` | `news_2026` | HTTP 201 | valid HTTPS URL and custom code |
| `http://example.com` | empty | HTTP 201 | valid HTTP URL and automatic code |
| `example.com` | empty | HTTP 400 `INVALID_ORIGINAL_URL` | missing protocol |
| `ftp://example.com` | empty | HTTP 400 `INVALID_ORIGINAL_URL` | unsupported protocol |
| empty | empty | HTTP 400 `INVALID_ORIGINAL_URL` | missing original URL |
| `https://example.com` | `ab` | HTTP 400 `INVALID_SHORT_CODE` | below minimum length |
| `https://example.com` | `a/b` | HTTP 400 `INVALID_SHORT_CODE` | forbidden slash |
| `https://example.com` | 33 ASCII letters | HTTP 400 `INVALID_SHORT_CODE` | above maximum length |

### Requirement: Duplicate custom short-code response
The backend SHALL map a PostgreSQL unique-constraint conflict for a requested custom code to HTTP 409 with the JSON error code `SHORT_CODE_CONFLICT` and MUST NOT expose SQL or database connection details.

#### Scenario: Reject a duplicate custom code
- **GIVEN** short code `news_2026` already exists
- **WHEN** the client posts another valid link with `customCode` equal to `news_2026`
- **THEN** the backend responds with HTTP 409 and `{ "error": { "code": "SHORT_CODE_CONFLICT", "message": "此短碼已被使用" } }`

### Requirement: Short link metadata API
The backend SHALL expose `GET /api/short-links/:shortCode` to return the stored original URL, short code, public short URL, and numeric click count without changing the click count.

#### Scenario: Retrieve existing metadata
- **GIVEN** short code `news_2026` exists with click count `4`
- **WHEN** the client requests `GET /api/short-links/news_2026`
- **THEN** the backend responds with HTTP 200, returns numeric `clickCount` equal to `4`, and leaves the stored count equal to `4`

#### Scenario: Retrieve missing metadata
- **WHEN** the client requests metadata for a short code that does not exist
- **THEN** the backend responds with HTTP 404 and JSON error code `SHORT_LINK_NOT_FOUND`

### Requirement: Redirect and atomic click counting
The backend SHALL expose `GET /:shortCode` to atomically increment the stored click count exactly once for an existing short code and respond with HTTP 302 whose `Location` is the stored original URL.

#### Scenario: Redirect an existing short code
- **GIVEN** `news_2026` points to `https://example.com/article` and has click count `4`
- **WHEN** a visitor requests `GET /news_2026`
- **THEN** the backend atomically changes the click count to `5` and responds with HTTP 302 and `Location: https://example.com/article`

#### Scenario: Preserve concurrent increments
- **GIVEN** a short link has click count `0`
- **WHEN** 10 redirect requests for its short code are processed concurrently and all resolve the existing row
- **THEN** the stored click count becomes `10`

#### Scenario: Render a missing-link page
- **WHEN** a visitor requests a short code that does not exist
- **THEN** the backend responds with HTTP 404, a UTF-8 HTML content type, and a simple page indicating that the short link was not found

### Requirement: Safe backend failures
The backend MUST return JSON errors for API failures, MUST prevent unhandled rejected requests from terminating the process, and MUST NOT expose SQL text, credentials, connection strings, or stack traces in HTTP responses.

#### Scenario: Unexpected database failure during an API request
- **WHEN** PostgreSQL returns an unexpected error while an API route is processing
- **THEN** the backend responds with HTTP 500 and JSON error code `INTERNAL_ERROR` without database or stack-trace details

#### Scenario: Unexpected database failure during redirect
- **WHEN** PostgreSQL returns an unexpected error while a redirect route is processing
- **THEN** the backend responds with HTTP 500 without exposing database or stack-trace details and does not emit a redirect response
