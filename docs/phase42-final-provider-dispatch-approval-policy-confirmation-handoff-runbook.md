# Runbook – Phase 42 Final Provider Dispatch Approval Policy Confirmation Handoff

## Verify
```powershell
npm run phase42:3:verify
npm run llm:provider-dispatch-approval-policy-confirmation-envelope:final:check
npm run build
```

## Optional Smoke
```powershell
npm run stack:health
npm run phase42:2:smoke
```

## Sicherheit
Phase 42 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte, keinen sensiblen Request Body und keine Provider Response im Confirmation Envelope. Approval Candidate bleibt Human-Approval-ready, aber nicht approved und nicht ausgeführt. Policy Confirmation bestätigt nur Human-Approval-only.
