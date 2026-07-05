# Phase 43.1 – Provider Dispatch Human Approval Token Policy & Audit

## Ziel
Human Approval Token Envelopes werden per Policy Simulation geprüft und als Governance Audit Events protokolliert.

## UI/API
- UI: /provider-dispatch-human-approval-token-policy
- API: /api/provider-dispatch-human-approval-token-policy

## Sicherheitsinvarianten
- providerDispatchHumanApprovalTokenEnvelopePrepared=true
- humanApprovalTokenEnvelopePrepared=true
- humanApprovalTokenEnvelopePersisted=true
- humanApprovalTokenReadyForHumanApproval=true
- humanApprovalTokenIssued=false
- humanApprovalTokenActivated=false
- humanApprovalTokenConsumed=false
- approvalPolicyConfirmedForHumanApprovalOnly=true
- approvalCandidateApproved=false
- approvalCandidateExecuted=false
- approvalCandidateContainsProviderResponse=false
- approvalCandidateContainsPromptPayload=false
- approvalCandidateContainsSecrets=false
- networkCallAllowed=false
- networkCallPerformed=false
- providerExecutionAllowed=false
- realLlmCallAllowed=false
- llmCallPerformed=false
- executionAllowed=false
- toolExecutionAllowed=false
- agentExecutionAllowed=false
- dryRunOnly=true

## Nächster Schritt
Phase 43.2 – Provider Dispatch Human Approval Token Dashboard & Smoke
