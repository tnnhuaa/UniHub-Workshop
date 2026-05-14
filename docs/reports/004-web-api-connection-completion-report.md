# Completion Report: Web API Connection

## Scope
Connected the student-facing web pages to the real backend API while keeping the sign-in/sign-up flow on the existing mock auth path.

## Completed Work
- Added a shared browser API client with JSON parsing, credentials, query string handling, and backend error mapping.
- Added typed UniHub API wrappers for workshops, students, registrations, and registration QR retrieval.
- Added adapter helpers to map backend DTOs into UI view models.
- Rewired the workshop list page hook to load real workshops from the backend.
- Rewired workshop detail, checkout, schedule, and profile pages to consume backend data.
- Disabled unsupported cancel/save actions in the UI instead of keeping mock side effects.
- Added `.copilot_temp/tasks.md` with the implementation order and acceptance criteria.

## Verification
- `get_errors` on all touched web files: passed.
- `pnpm -C apps/web build`: passed.

## Checklist
- DTOs validated via Zod: N/A for this frontend-only change set.
- External services use adapter interfaces: pass for frontend data mapping layer.
- Cross-cutting concerns centralized: pass for API transport/idempotency header handling.
- Unit + integration tests written and passing: not added in this slice.
- README / docs updated: pass for implementation notes in the report and temp task file.
- No raw SQL: N/A for this frontend-only change set.
- Registration/payment concurrency coverage: N/A for this frontend-only change set.
- Offline check-in dedupe coverage: N/A for this frontend-only change set.
- Worker job persistence coverage: N/A for this frontend-only change set.

## Notes
- The checkout page now sends only `{ mssv, workshopId }` with an `Idempotency-Key` header.
- The schedule page fetches QRs from `GET /registrations/:id/qr` and disables cancel because the backend does not expose a cancel endpoint yet.
- Profile updates remain local-only because the backend currently exposes read-only student profile endpoints.

## Proposed Commit Message
feat(web): connect student pages to backend API

- Connected workshop list, detail, checkout, schedule, and profile pages to real backend API endpoints.
- Added shared API client with JSON parsing, error handling, and typed API wrappers.
- Added DTO adapters to transform backend data into UI view models.
- Disabled unsupported profile updates and registration cancellations.
- Verified with successful build and no lint errors.
