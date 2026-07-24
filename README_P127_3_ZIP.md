# phase127-3.zip

Phase 127.3 - Secure Master Main View Handoff

Run:

```powershell
node scripts/p127-3.cjs
npm run phase127:3:verify
npm run build
```

Optional smoke when frontend runs on port 3000:

```powershell
npm run phase127:3:smoke
```

Optional smoke when frontend runs on port 3001:

```powershell
$env:PORT=3001; npm run phase127:3:smoke
```

Main test page:

```text
http://localhost:3001/cmt/master/secure
```
