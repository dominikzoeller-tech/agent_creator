# Runbook – Phase 35 Final Provider Dispatch Final Preflight Handoff

## Verify
```powershell
npm run phase35:3:verify
npm run llm:provider-dispatch-final-preflight:final:check
npm run build
```

## Optional Smoke
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase35:2:smoke
```

## Sicherheit
Phase 35 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte und keinen sensiblen Request Body. Final Dispatch bleibt explizit blockiert.
