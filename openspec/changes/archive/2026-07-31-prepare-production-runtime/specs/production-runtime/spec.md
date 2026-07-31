## ADDED Requirements

### Requirement: Deterministic environment loading
The runtime MUST load optional local environment values from `server/.env`, MUST preserve values already supplied by the process environment, and MUST NOT require a committed secret file.

#### Scenario: Platform secrets take precedence
- **GIVEN** `server/.env` contains a placeholder `DATABASE_URL`
- **WHEN** the process starts with a different `DATABASE_URL` already present in its environment
- **THEN** the runtime uses the process-provided value and does not overwrite it

#### Scenario: Missing required configuration
- **WHEN** neither the process environment nor `server/.env` supplies `DATABASE_URL` or `PUBLIC_BASE_URL`
- **THEN** startup fails before accepting HTTP requests and does not print credential values

### Requirement: Repeatable database migration command
The project SHALL provide a migration command that executes the checked-in PostgreSQL migration in one transaction, SHALL be safe to run more than once, and MUST exit unsuccessfully after rolling back a failed migration.

#### Scenario: Repeated migration succeeds
- **GIVEN** a reachable empty PostgreSQL database
- **WHEN** the migration command runs twice
- **THEN** both runs exit with status 0 and the `short_links` table has one unique constraint on `short_code`

#### Scenario: Migration statement fails
- **WHEN** PostgreSQL rejects a statement during the migration transaction
- **THEN** the command rolls back, closes its database resources, exits non-zero, and does not print the connection string

### Requirement: Database readiness endpoint
The backend SHALL expose `GET /api/health` as a database readiness check with fixed safe JSON responses.

#### Scenario: Database is ready
- **WHEN** the readiness query succeeds
- **THEN** the endpoint responds with HTTP 200 and `{ "status": "ok" }`

#### Scenario: Database is unavailable
- **WHEN** the readiness query rejects
- **THEN** the endpoint responds with HTTP 503 and `{ "status": "unavailable" }` without SQL, stack, host, username, or password details

### Requirement: Single-process production HTTP runtime
The production runtime SHALL serve the built frontend, short-link API, and public redirect routes from one Express process and one origin, and MUST fail before listening when the frontend build entry file is missing.

#### Scenario: Serve the built frontend
- **GIVEN** a successful Vite build exists and the runtime uses `NODE_ENV=production`
- **WHEN** a visitor requests `/` or a built asset path
- **THEN** Express returns the frontend HTML or asset without treating the asset name as a short code

#### Scenario: Preserve API and redirect routes
- **WHEN** the production runtime receives `POST /api/short-links` or `GET /:shortCode`
- **THEN** it preserves the specified API creation and 302/404 redirect behavior

#### Scenario: Missing production build
- **WHEN** production startup cannot find `dist/index.html`
- **THEN** startup exits unsuccessfully before binding the HTTP port

### Requirement: Deployment-preparation operator workflow
The repository SHALL document and expose commands for dependency installation, local environment setup, migration, build, production start, readiness verification, smoke testing, and rollback preparation without performing a cloud deployment.

#### Scenario: Follow deployment-preparation documentation
- **WHEN** an operator follows the README from a clean checkout with a provisioned PostgreSQL URL
- **THEN** the operator can build the frontend, migrate the database, start the single production process, verify `/api/health`, and exercise short-link creation and redirect before choosing a hosting platform