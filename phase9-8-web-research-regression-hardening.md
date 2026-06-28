# Phase 9.8 – Web Research Regression & Hardening

## Ziel

Phase 9.8 macht den Web-Research-Block releasefähiger durch Regression Checks, Smoke Tests und Hardening-Doku.

## Neue Dateien

```text
scripts/phase9-8-web-research-smoke.cjs
scripts/phase9-8-verify-web-research-hardening.cjs
docs/web-research-test-matrix.md
docs/web-research-hardening-runbook.md
```

## Neue Scripts

```powershell
npm run web:research:hardening:verify
npm run web:research:smoke
```

## Smoke-Test prüft

- `/api/web-research`
- `/api/web-research-governance`
- `/api/web-research-settings`
- `/api/web-research-save`
- Secret-Leak-Schutz in API-Responses
- Governance-Block bei unsicheren Payloads

## Anwendung

```powershell
node scripts/phase9-8-patch-web-research-hardening.cjs
npm run web:research:hardening:verify
npm run web:research:smoke
```

## Voraussetzung für Smoke Test

Stack muss laufen:

```powershell
npm run stack:up:detached
npm run stack:health
```

## Danach committen

```powershell
git add package.json README.md docs/web-research-test-matrix.md docs/web-research-hardening-runbook.md
git add scripts/phase9-8-patch-web-research-hardening.cjs scripts/phase9-8-verify-web-research-hardening.cjs scripts/phase9-8-web-research-smoke.cjs
git add phase9-8-web-research-regression-hardening.md
git commit -m "test: add web research hardening checks"
git push origin main
```

## Nächster Schritt

Phase 9.9 – Web Research Release Polish:

- finale Navigation glätten
- Release Notes ergänzen
- Web Research Aktivierungsanleitung finalisieren
- Phase 9 Abschlusscheck
