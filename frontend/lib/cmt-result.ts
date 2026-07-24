import { createCommitteeSession, type CommitteeSession } from './cmt-session';

export type CommitteeDecisionResult = {
  phase: '111.1';
  label: 'Gremium Ergebnis';
  session: CommitteeSession;
  decision: {
    verdict: 'proceed-dry-run' | 'revise-before-proceeding' | 'blocked';
    shortAnswer: string;
    rationale: string[];
    risks: string[];
    nextActions: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeDecisionResult(question: string): CommitteeDecisionResult {
  const session = createCommitteeSession(question);
  const deliberation = session.deliberation;
  return {
    phase: '111.1',
    label: 'Gremium Ergebnis',
    session,
    decision: {
      verdict: deliberation.aggregate.recommendation,
      shortAnswer: 'Das Gremium hat die Nutzerfrage dry-run-only bewertet und eine erste Handlungsempfehlung erstellt.',
      rationale: deliberation.opinions.map((opinion) => opinion.title + ': ' + opinion.stance),
      risks: deliberation.aggregate.mainRisks,
      nextActions: deliberation.aggregate.nextSteps,
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeDecisionResultDemo() {
  return createCommitteeDecisionResult('Soll der Agent die Gremiumsantwort als klares Ergebnis mit Risiken und naechsten Schritten anzeigen?');
}
