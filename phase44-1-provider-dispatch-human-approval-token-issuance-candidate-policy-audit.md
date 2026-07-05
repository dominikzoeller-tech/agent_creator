# Phase 44.1 – Provider Dispatch Human Approval Token Issuance Candidate Policy & Audit

## Ziel
Human Approval Token Issuance Candidate Envelopes werden per Policy Simulation geprüft und als Governance Audit Events protokolliert.

## UI/API
- UI: /provider-dispatch-human-approval-token-issuance-candidate-policy
- API: /api/provider-dispatch-human-approval-token-issuance-candidate-policy

## Sicherheitsinvarianten
- providerDispatchHumanApprovalTokenIssuanceCandidatePrepared=true
- humanApprovalTokenIssuanceCandidatePrepared=true
- humanApprovalTokenIssuanceCandidatePersisted=true
- humanApprovalTokenReadyForIssuanceReview=true
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
Phase 44.2 – Provider Dispatch Human Approval Token Issuance Candidate Dashboard & Smoke
