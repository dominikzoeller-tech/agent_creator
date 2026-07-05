# Phase 45.2a Hotfix – Issuance Confirmation Policy Store + Phase 45.3 Scripts

Fixes:
- repaired malformed regex/newline output in `frontend/lib/provider-dispatch-human-approval-token-issuance-confirmation-policy-store.ts`
- adds missing Phase 45.3 patch/verify scripts and package.json scripts

Run:

```powershell
node scripts/phase45-2a-hotfix-issuance-confirmation-policy-store-and-handoff.cjs
node scripts/phase45-2a-verify-issuance-confirmation-policy-store-and-handoff.cjs
npm run build
```
