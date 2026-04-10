# Release Checklist

Use this checklist before shipping to production.

Status legend:
- `[x]` Verified in this session (code-level and/or command validation)
- `[ ]` Pending manual verification in staging/production
- `Blocked` Could not be executed in this environment

## Backend

- [ ] Run migrations on staging and production.
- [ ] Verify `auth:sanctum` protected routes work with mobile token auth.
- [x] Verify category ownership checks block cross-user `category_id` usage.
- [ ] Run backend tests:
  - [ ] `php backend/artisan test --filter=FinanceApiTest` (Blocked: vendor/phpunit missing in current environment)
  - [ ] full test suite
- [x] Confirm recurring scheduler is active (`recurring:process`).
- [ ] Review Laravel logs for unexpected warnings/errors.

## Mobile Functional Checks

- [ ] Login/register/logout works.
- [ ] PIN lock: enable, lock on background, unlock with correct PIN.
- [ ] Biometric login still works when enabled.
- [ ] Home screen loads and reminder banner appears when applicable.
- [ ] Start new month flow does not delete history.
- [ ] Offline queue:
  - [ ] add while offline
  - [ ] sync on reconnect
  - [ ] conflict retry/discard works
- [ ] CSV import:
  - [ ] valid file imports
  - [ ] invalid rows show readable errors
  - [ ] quoted comma fields parse correctly
- [ ] Backup/restore:
  - [ ] backup JSON generated
  - [ ] restore imports expected records
  - [ ] dedupe prevents obvious duplicates
- [ ] Financial health screen loads and values render.

## Quality & Performance

- [x] Run mobile lint / static checks.
- [x] Verify no obvious debug logs or noisy alerts in release build.
- [ ] Validate dark mode across key screens.
- [ ] Smoke test low-connectivity experience.

## Security & Config

- [ ] Confirm production API URL is correct.
- [ ] Ensure secrets are not committed.
- [ ] Confirm CORS and Sanctum settings for production domain(s).
- [ ] Verify secure storage data handling (token, biometrics, PIN).

## Final Go/No-Go

- [ ] Product owner sign-off
- [ ] QA sign-off
- [ ] Release notes prepared
- [ ] Rollback plan documented

## Session Verification Evidence

- [x] `sh -n backend/docker-entrypoint.sh` passed.
- [x] PHP syntax checks passed for updated API controllers.
- [x] `console.log` / `console.warn` sweep in `mobile/src` returned no matches.
- [x] Added release deployment docs: `backend/DEPLOY_AWS.md`, `backend/.env.aws.example`, `backend/docker-compose.aws.yml`.
