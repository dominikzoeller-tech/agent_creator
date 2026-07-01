# Phase 11.7b – Tool Consent Navigation & Docs Verify Hotfix

Dieser Hotfix ersetzt den zu strengen 11.7a-Hotfix. Er sucht nicht mehr exakt nach `<main className="page-wrap">`, sondern fügt `UnifiedNavigation` robust nach dem ersten `<main>` oder ersatzweise `<div>` in `frontend/app/tool-consent/page.tsx` ein.

Ausführen:

```powershell
node scripts/phase11-7b-hotfix-tool-consent-navigation-docs.cjs
npm run phase11:7b:verify
npm run phase11:7:verify
npm run build
npm run stack:health
git status --short
```
