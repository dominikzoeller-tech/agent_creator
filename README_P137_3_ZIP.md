# phase137-3.zip

Phase 137.3 - Secure Master Answer Log JSON Export Handoff

Run:

```powershell
node scripts/p137-3.cjs
npm run phase137:3:verify
npm run build
```

Optional smoke when frontend runs on port 3000:

```powershell
npm run phase137:3:smoke
```

Optional smoke when frontend runs on port 3001:

```powershell
$env:PORT=3001; npm run phase137:3:smoke
```

Main export test page:

```text
http://localhost:3001/cmt/master/secure/main/log/list/export-json
```
