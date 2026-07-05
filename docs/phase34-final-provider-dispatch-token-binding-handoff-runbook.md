# Runbook – Phase 34 Final Provider Dispatch Token Binding Handoff

## Verify
```powershell
npm run phase34:3:verify
npm run llm:provider-dispatch-token-binding:final:check
npm run build
```

## Optional Smoke
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase34:2:smoke
```

## Sicherheit
Phase 34 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte und keinen sensiblen Request Body.
