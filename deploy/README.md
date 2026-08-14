# Root-controlled deployment

These files are reviewed templates, not automatically installed by the build.

1. Root creates versioned releases below `/var/www/eilps/*-releases/`.
2. Root verifies the release checksum manifest and acceptance evidence.
3. Runtime ownership is `eilps:eilps`; release contents become read-only.
4. Root atomically changes the corresponding `*-current` pointer.
5. The four active services run as `eilps`: `eilps-web`, `eilps-api`, `eilps-worker`, and `eilps-learner`.
6. The inactive legacy `eilps.service` is untouched.
7. Developer source remains under the developer account and is never a runtime path.
8. No promotion may select a release or source older than 14 August 2026.

For a backend promotion, the wrapper updates `backend-current`, then restarts and verifies `eilps-api` and `eilps-worker` together.
