# Phase 11.2a – Hotfix Compose Consent Data Dir

Dieser Hotfix behebt zwei Dinge:

1. `TOOL_CONSENT_DATA_DIR` darf nicht unter `services.frontend.build` stehen, sondern muss unter `environment` stehen.
2. Der Root hatte kein `npm run build`; der Hotfix ergänzt ein Root-Build-Script für Frontend-Build plus API-TypeScript-Check.

Ausführen:

```powershell
node scripts/phase11-2a-hotfix-compose-consent-data-dir.cjs
npm run phase11:2a:verify
docker compose -f docker-compose.internal.yml config
```
