# phase128-3.zip

Phase 128.3 - Secure Master Structured Main View Handoff

Run:

```powershell
node scripts/p128-3.cjs
npm run phase128:3:verify
npm run build
```

Optional smoke when frontend runs on port 3000:

```powershell
npm run phase128:3:smoke
```

Optional smoke when frontend runs on port 3001:

```powershell
$env:PORT=3001; npm run phase128:3:smoke
```

Main test page:

```text
http://localhost:3001/cmt/master/secure
```
