# Phase 9 Completion Checklist

## Verify

```powershell
npm run web:research:release:verify
npm run web:research:hardening:verify
```

## Smoke

```powershell
npm run stack:up:detached
npm run stack:health
npm run web:research:smoke
```

## Manual UI Checks

- `/web-research` sichtbar
- `/web-research-save` sichtbar
- `/web-research-governance` sichtbar
- `/web-research-settings` sichtbar
- `/analytics` zeigt Web-Research-Analytics
- Chat zeigt Web-Research-Panel

## Secret Safety

```powershell
git ls-files .env
git status --short .env
```

Erwartung:

- `.env nicht getrackt`
- keine Secret-Werte in `git diff`
- keine API-Keys in Screenshots posten

## Final Release Check

```powershell
npm run web:research:release:check
npm run stack:health
git status --short
```

## Commit

```powershell
git add package.json README.md .env.example
git add docs/web-research-release-notes.md docs/web-research-activation-guide.md docs/phase9-completion-checklist.md
git add scripts/phase9-9-patch-web-research-release.cjs scripts/phase9-9-verify-web-research-release.cjs
git add phase9-9-web-research-release-polish.md
git commit -m "docs: finalize web research release"
git push origin main
```
