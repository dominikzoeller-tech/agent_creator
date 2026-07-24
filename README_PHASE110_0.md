# Phase 110.0 - Gremium Core

Erster echter MVP-Baustein fuer den Gremium-Agenten.

Diese Phase baut ein internes simuliertes Gremium mit kurzen Namen:

- UI: /cmt
- API: /api/cmt
- Store: frontend/lib/cmt-store.ts
- Patch: scripts/p110-0.cjs
- Verify: scripts/v110-0.cjs

Rollen:

- strategy
- legal
- technical
- finance
- risk
- execution

Safety bleibt locked:

- provider = none
- modelSelected = none
- dryRunOnly = true
- finalDispatchBlocked = true
- executionGateClosed = true
- networkCallAllowed = false
- providerDispatchAllowed = false
