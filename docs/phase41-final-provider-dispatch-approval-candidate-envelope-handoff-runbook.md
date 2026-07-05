# Runbook – Phase 41 Final Provider Dispatch Approval Candidate Envelope Handoff

## Verify
```powershell
npm run phase41:3:verify
npm run llm:provider-dispatch-approval-candidate-envelope:final:check
npm run build
```

## Optional Smoke
```powershell
npm run stack:health
npm run phase41:2:smoke
```

## Sicherheit
Phase 41 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte, keinen sensiblen Request Body und keine Provider Response im Approval Candidate Envelope. Der Approval Candidate bleibt Human-Approval-ready, aber nicht approved und nicht ausgeführt.
