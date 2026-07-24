# phase121-3.zip

Phase 121.3 - Privacy Gate Handoff

Run:

```powershell
node scripts/p121-3.cjs
npm run phase121:3:verify
npm run build
```

Optional smoke when frontend runs on port 3000:

```powershell
npm run phase121:3:smoke
```

Optional smoke when frontend runs on port 3001:

```powershell
$env:PORT=3001; npm run phase121:3:smoke
```

Main pages:

```text
http://localhost:3001/cmt/privacy
http://localhost:3001/cmt/privacy/status
http://localhost:3001/cmt/privacy/decision
```
