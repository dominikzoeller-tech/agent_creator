# Phase 9.9 – Web Research Release Polish

## Ziel

Phase 9.9 finalisiert den Web-Research-Block als Release.

## Enthalten

- finale Navigation zu allen Web-Research-Seiten
- Release Notes
- Aktivierungsanleitung
- Completion Checklist
- Release Verify Script
- Release Check Script

## Anwendung

```powershell
node scripts/phase9-9-patch-web-research-release.cjs
npm run web:research:release:verify
```

Optional vollständiger Release-Check:

```powershell
npm run web:research:release:check
```

## Voraussetzung für Release Check

Der Stack muss laufen:

```powershell
npm run stack:up:detached
npm run stack:health
```

## Danach committen

```powershell
git add package.json README.md .env.example
git add docs/web-research-release-notes.md docs/web-research-activation-guide.md docs/phase9-completion-checklist.md
git add scripts/phase9-9-patch-web-research-release.cjs scripts/phase9-9-verify-web-research-release.cjs
git add phase9-9-web-research-release-polish.md
git commit -m "docs: finalize web research release"
git push origin main
```

## Nächster großer Schritt

Phase 10.0 kann danach starten:

- Tool Registry
- Agent Tool Permissions
- UI für Tools
- Governance für alle Tools, nicht nur Web Research
