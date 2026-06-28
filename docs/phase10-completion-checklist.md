# Phase 10 Completion Checklist

## Verify Scripts

```powershell
npm run tools:registry:verify
npm run tools:permissions:verify
npm run tools:preflight:verify
npm run tools:preflight:debug:verify
npm run tools:preflight:panel:verify
npm run tools:preflight:analytics:verify
npm run tools:enforcement:prep:verify
npm run tools:enforcement:panel:verify
npm run tools:enforcement:analytics:verify
npm run tools:governance:release:verify
```

## Smoke Test

```powershell
npm run tools:governance:smoke
```

## Docker Check

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api frontend
npm run stack:up:detached
npm run stack:health
```

## Manual Browser Checks

```text
http://localhost:3000/tools
http://localhost:3000/tool-permissions
http://localhost:3000/tool-preflight
http://localhost:3000/analytics
```

## Chat Checks

Fragen:

```text
Was ist aktuell zu Privacy-first AI Agents relevant?
Suche in der Knowledge Base nach Web Research.
Bitte speicher das als Memory.
```

Erwartung:

- Tool Preflight Panel sichtbar
- Tool Enforcement Panel sichtbar
- Tool-Enforcement-Analytics sichtbar nach neuen Logs

## Secret Safety

```powershell
git ls-files .env
git status --short .env
```

Erwartung: keine Ausgabe.

## Phase 10 Abschluss

Wenn alle Checks grün sind:

```powershell
git status --short
git log --oneline -5
```
