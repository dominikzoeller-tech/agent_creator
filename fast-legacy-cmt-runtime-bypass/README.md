# fast-legacy-cmt-runtime-bypass

Ziel: Build schneller gruen bekommen, ohne weitere Legacy-TypeScript-Felder einzeln zu patchen.

Dieser Patch macht drei Dinge:

1. Er ergaenzt fehlende Runtime-Exports:
   - `askSecureMasterCommittee` in `cmt-master-committee.ts`
   - `createCommitteeAskState` in `cmt-ask.ts`

2. Er setzt CMT-Pages, die keine Client Components sind, auf dynamisches Rendering:
   - `export const dynamic = 'force-dynamic';`
   - `export const revalidate = 0;`

   Dadurch werden alte Legacy-CMT-Seiten nicht mehr beim Build statisch vorgerendert.

3. Er fuegt einen Verify-Task hinzu.

Ausfuehren:

```powershell
node .\fast-legacy-cmt-runtime-bypass\scripts\fast-legacy-cmt-runtime-bypass.cjs
npm run fastlegacyruntime:verify
npm run build
```

Wenn Build gruen:

```powershell
git status --short
git add .
git commit -m "chore: bypass legacy cmt prerender runtime issues"
git push origin main
```
