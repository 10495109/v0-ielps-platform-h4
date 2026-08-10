# IELPS PiP Mascot Deployment Pack

Generated: 2026-08-10

Scope: deployment-ready PiP mascot assets, frontend component, scoped styles, language manifest, backend contracts, voice/caption script map, and browser preview.

No live platform, server, backend, deployment, route, branding, or colour changes are included in this package.

## Included

- `assets/pip-mascot.png` - generated PiP mascot artwork.
- `assets/pip-fallback.svg` - deterministic SVG fallback.
- `src/PipAgent.tsx` - React/TypeScript component.
- `src/pip-agent.css` - scoped CSS, no global theme leak.
- `manifests/pip-language-manifest.json` - supported languages and captions.
- `manifests/pip-endpoint-contracts.json` - API contracts and payloads.
- `docs/pip-deployment-brief.md` - pathways, flow, features, states, safeguards.
- `preview/pip-preview.html` - standalone local preview.

## Primary Backend Endpoints

```text
GET  /api/agent/config
POST /api/agent/chat
POST /api/agent/voice
```

## Language Rule

Detection priority:

```text
Manual user choice
→ browser Accept-Language
→ Cloudflare country/IP headers
→ English fallback
```

Supported initial languages:

```text
English, Spanish, Arabic, Chinese, French, Portuguese
```

