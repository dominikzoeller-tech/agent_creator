# phase135-3.zip

Phase 135.3 - Secure Master Browser Log Store Handoff

Run:

```powershell
node scripts/p135-3.cjs
npm run phase135:3:verify
npm run build
```

Optional smoke when frontend runs on port 3000:

```powershell
npm run phase135:3:smoke
```

Optional smoke when frontend runs on port 3001:

```powershell
$env:PORT=3001; npm run phase135:3:smoke
```

Main browser-store test page:

```text
http://localhost:3001/cmt/master/secure/main/log/list/browser-store
```
