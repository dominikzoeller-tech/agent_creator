# phase134-3.zip

Phase 134.3 - Secure Master Main Log List Select Handoff

Run:

```powershell
node scripts/p134-3.cjs
npm run phase134:3:verify
npm run build
```

Optional smoke when frontend runs on port 3000:

```powershell
npm run phase134:3:smoke
```

Optional smoke when frontend runs on port 3001:

```powershell
$env:PORT=3001; npm run phase134:3:smoke
```

Main test page:

```text
http://localhost:3001/cmt/master/secure/main/log/list
```
