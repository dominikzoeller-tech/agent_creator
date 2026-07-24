# phase133-3.zip

Phase 133.3 - Secure Master Local Answer Log List Filter Select Handoff

Run:

```powershell
node scripts/p133-3.cjs
npm run phase133:3:verify
npm run build
```

Optional smoke when frontend runs on port 3000:

```powershell
npm run phase133:3:smoke
```

Optional smoke when frontend runs on port 3001:

```powershell
$env:PORT=3001; npm run phase133:3:smoke
```

Main select test page:

```text
http://localhost:3001/cmt/master/secure/main/log/list/filter/select
```
