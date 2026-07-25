# fix-exact-missing-imports

Targeted build fix for missing legacy relative imports and duplicate generated stub exports.

Fixes errors like:

```text
Module not found: Can't resolve '../../../../../../../lib/cmt-master-committee'
Identifier 'cmtMasterAnswerLogListBrowserStore' has already been declared
```

What it does:

- Scans `frontend/app/**/*.ts(x)` imports.
- Resolves each relative import to the exact filesystem path that Next/Webpack expects.
- If that exact module is missing, creates a compatibility stub at that exact path.
- Rewrites previously generated duplicate stubs with unique exports only.

Run:

```powershell
node .\fix-exact-missing-imports\scripts\fix-exact-missing-imports.cjs
npm run fixexact:verify
npm run build
```
