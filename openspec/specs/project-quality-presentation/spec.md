# project-quality-presentation Specification

## Purpose

TBD - created by archiving change 'improve-interview-readiness'. Update Purpose after archive.

## Requirements

### Requirement: Interview project overview
The repository README SHALL present the deployed product, core capabilities, technology stack, architecture, local workflow, verification commands, and deployment model without exposing credentials.

#### Scenario: Reviewer evaluates the repository
- **WHEN** a reviewer opens the repository README
- **THEN** the reviewer can access the live demo and identify the frontend, backend, database, hosting, local setup, test, build, and production start information from the document


<!-- @trace
source: improve-interview-readiness
updated: 2026-07-31
code:
  - README.md
  - .github/workflows/ci.yml
-->

---
### Requirement: Automated repository quality gate
The repository MUST run the complete automated test suite and production frontend build for pushes and pull requests through GitHub Actions using supported Node.js setup and deterministic dependency installation.

#### Scenario: A change is pushed or proposed
- **WHEN** GitHub receives a push or pull request for the repository
- **THEN** CI installs the root and server dependencies, runs the complete test suite, and runs the production build with failure in any step failing the workflow


<!-- @trace
source: improve-interview-readiness
updated: 2026-07-31
code:
  - README.md
  - .github/workflows/ci.yml
-->

---
### Requirement: Visible CI status
The README SHALL display a CI badge linked to the repository workflow status.

#### Scenario: Reviewer checks current quality status
- **WHEN** a reviewer views the README on GitHub
- **THEN** the reviewer can see whether the latest CI workflow completed successfully

<!-- @trace
source: improve-interview-readiness
updated: 2026-07-31
code:
  - README.md
  - .github/workflows/ci.yml
-->