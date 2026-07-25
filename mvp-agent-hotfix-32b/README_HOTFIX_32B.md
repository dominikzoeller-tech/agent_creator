# mvp-agent-hotfix-32b

Fix fuer Runtime ReferenceError auf `/cmt/master/secure/agent`.

Problem:

`secureMasterWorkState is not defined`

Ursache:

Die Seite verwendet `secureMasterWorkState`, aber der Import oder die Lib fehlt.

Fix:

- legt `frontend/lib/cmt-secure-master-work-state.ts` an, falls fehlt
- fuegt den Import in `frontend/app/cmt/master/secure/agent/page.tsx` ein, falls fehlt
- prueft die relevanten Tokens

Ausfuehren:

```powershell
node .\mvp-agent-hotfix-32b\scripts\mvp-agent-hotfix-32b.cjs
npm run hotfix32b:verify
npm run build
```
