# phase123-3.zip

Phase 123.3 - Secure Master Entry Handoff

Run:

```powershell
node scripts/p123-3.cjs
npm run phase123:3:verify
npm run build
```

Optional smoke when frontend runs on port 3000:

```powershell
npm run phase123:3:smoke
```

Optional smoke when frontend runs on port 3001:

```powershell
$env:PORT=3001; npm run phase123:3:smoke
```

Main local test page:

```text
http://localhost:3001/cmt/master/secure
```
