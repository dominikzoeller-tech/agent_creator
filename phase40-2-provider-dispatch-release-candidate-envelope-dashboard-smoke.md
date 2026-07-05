# Phase 40.2 – Provider Dispatch Release Candidate Envelope Dashboard & Smoke

## Ziel

Release Candidate Envelopes und Policy Simulationen werden in einem Dashboard zusammengeführt und per Smoke-Test prüfbar gemacht.

## Neue UI

- /provider-dispatch-release-candidate-envelope-dashboard

## Sicherheitsprinzip

- providerDispatchReleaseCandidateEnvelopePrepared=true
- releaseCandidateEnvelopePrepared=true
- releaseCandidateEnvelopePersisted=true
- releaseCandidateReadyForHumanReview=true
- releaseCandidateApproved=false
- releaseCandidateExecuted=false
- releaseCandidateContainsProviderResponse=false
- releaseCandidateContainsPromptPayload=false
- releaseCandidateContainsSecrets=false
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

Phase 40.3 – Final Provider Dispatch Release Candidate Envelope Handoff / Release Summary
