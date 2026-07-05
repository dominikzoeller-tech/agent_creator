# Runbook – Phase 44 Final Provider Dispatch Human Approval Token Issuance Candidate Handoff

## Verify
```powershell
npm run phase44:3:verify
npm run llm:provider-dispatch-human-approval-token-issuance-candidate:final:check
npm run build
```

## Optional Smoke
```powershell
npm run stack:health
npm run phase44:2:smoke
```

## Sicherheit
Phase 44 erlaubt weiterhin keinen Provider Dispatch, keinen Provider-/Netzwerk-Aufruf, keine aktive Token-Bindung, keinen Prompt Payload, keine Secret-Werte, keinen sensiblen Request Body und keine Provider Response. Der Issuance Candidate bleibt nur review-ready. Der Human Approval Token bleibt nicht issued, nicht aktiviert und nicht konsumiert.
