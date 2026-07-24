import { createCommitteeDecisionResult, type CommitteeDecisionResult } from './cmt-result';

export type CommitteeBrief = {
  phase: '111.2';
  label: 'Gremium Brief';
  result: CommitteeDecisionResult;
  brief: {
    headline: string;
    decision: string;
    why: string[];
    risks: string[];
    actions: string[];
    userMessage: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeBrief(question: string): CommitteeBrief {
  const result = createCommitteeDecisionResult(question);
  const verdict = result.decision.verdict;
  const headline = verdict === 'proceed-dry-run'
    ? 'Gremium empfiehlt Fortsetzung im Dry-run.'
    : verdict === 'revise-before-proceeding'
      ? 'Gremium empfiehlt Ueberarbeitung vor Fortsetzung.'
      : 'Gremium blockiert Fortsetzung.';

  return {
    phase: '111.2',
    label: 'Gremium Brief',
    result,
    brief: {
      headline,
      decision: verdict,
      why: result.decision.rationale,
      risks: result.decision.risks,
      actions: result.decision.nextActions,
      userMessage: 'Kurzfassung: ' + headline + ' Die Details bleiben intern und dry-run-only.',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeBriefDemo() {
  return createCommitteeBrief('Soll der Agent die Gremiumsentscheidung als kurze Nutzerantwort mit Risiken und Aktionen zusammenfassen?');
}
