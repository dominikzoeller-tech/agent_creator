# Runbook – Phase 40 Final Provider Dispatch Release Candidate Envelope Handoff

## Verify
```powershell
npm run phase40:3:verify
npm run llm:provider-dispatch-release-candidate-envelope:final:check
npm run build
```

## Optional Smoke
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase40:2:smoke
```

## Sicherheit
Phase 40 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte, keinen sensiblen Request Body und keine Provider Response im Release Candidate Envelope. Der Release Candidate bleibt Human-Review-ready, aber nicht approved und nicht ausgeführt.
