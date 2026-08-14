# IELPS Access Panel remediation

Controlled 14 August 2026 source release reconstructed from the exact approved Access Panel project. It preserves the landing visual while correcting API, status, lesson-completion, preview-protection and deployment contracts.

## Local review

```powershell
pnpm install --ignore-workspace --no-frozen-lockfile
pnpm run lint
pnpm run verify:remediation
pnpm run build
pnpm start --port 4178
```

Open `http://127.0.0.1:4178`.

For the authorised preview mount, build with `IELPS_PANEL_BASE_PATH=/learner/panel-preview`. API requests remain same-origin under `/api`; do not add an `/api/eilps` compatibility proxy.

## Deployment boundary

This package does not automatically deploy. Root must inspect `docs/AUDIT-REMEDIATION-2026-08-14.md`, verify the SHA-256 inventory, run authenticated acceptance tests, create a read-only `eilps:eilps` versioned release, and promote it atomically. The public landing page and canonical backend are not bundled or changed.
