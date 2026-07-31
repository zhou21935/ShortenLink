## ADDED Requirements

### Requirement: Backend creation error feedback
The frontend MUST map stable backend creation error codes to safe, actionable Traditional Chinese feedback and MUST restore the submission control after every failed request.

#### Scenario: Duplicate custom code
- **WHEN** the backend rejects creation with HTTP 409 and error code `SHORT_CODE_CONFLICT`
- **THEN** the frontend displays `此短碼已被使用，請換一組`, restores the submit control, and keeps any previously successful result visible

#### Scenario: Automatic code generation exhausted
- **WHEN** the backend rejects creation with HTTP 503 and error code `SHORT_CODE_GENERATION_FAILED`
- **THEN** the frontend asks the visitor to retry later and restores the submit control

#### Scenario: Network or unknown failure
- **WHEN** the request cannot reach the backend or the response does not contain a recognized error contract
- **THEN** the frontend displays `目前無法建立短網址，請稍後再試`, restores the submit control, and does not expose raw response or stack details

### Requirement: Backend creation lifecycle
The frontend SHALL submit valid form values to `POST /api/short-links`, SHALL prevent duplicate submissions while the request is pending, and SHALL render the successful backend result without substituting mock values.

#### Scenario: Successful custom-code creation
- **WHEN** a visitor submits `https://example.com/article` with custom code `news_2026` and the backend returns HTTP 201 with short URL `https://sho.rt/news_2026`
- **THEN** the submit control is disabled during processing and the result displays `https://sho.rt/news_2026`, the original URL, and numeric click count `0`

#### Scenario: Successful automatic-code creation
- **WHEN** a visitor submits a valid original URL with an empty custom code and the backend returns a generated 7-character short code
- **THEN** the frontend omits `customCode` from the JSON request and displays the exact generated short URL returned by the backend

#### Scenario: Duplicate submission while pending
- **WHEN** a creation request is pending and the visitor attempts another submission
- **THEN** the frontend sends no additional creation request until the pending request settles

#### Scenario: Validation blocks backend creation
- **WHEN** either field contains an invalid value and the visitor submits the form
- **THEN** the frontend does not call the creation adapter and focuses the first invalid field

## REMOVED Requirements

### Requirement: Mock creation lifecycle
**Reason**: The completed backend now provides persistent short-link creation, so fixed mock results no longer represent the product behavior.
**Migration**: Use the real backend creation lifecycle defined above through `POST /api/short-links`.

#### Scenario: Replace fixed mock results
- **WHEN** the frontend is upgraded to this capability
- **THEN** it no longer returns the fixed mock code `q7X2k9P` and uses the backend response instead