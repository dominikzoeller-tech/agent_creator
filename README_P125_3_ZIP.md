# phase125-3.zip

Phase 125.3 - Secure Master Committee Handoff

Run:

```powershell
node scripts/p125-3.cjs
npm run phase125:3:verify
npm run build
```

Optional smoke when frontend runs on port 3000:

```powershell
npm run phase125:3:smoke
```

Optional smoke when frontend runs on port 3001:

```powershell
$env:PORT=3001; npm run phase125:3:smoke
```

Main committee test page:

```text
http://localhost:3001/cmt/master/secure/committee
```
