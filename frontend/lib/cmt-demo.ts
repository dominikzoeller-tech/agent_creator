import { createCommitteeSessionSummary, type CommitteeSessionSummary } from './cmt-sum';

export type CommitteeMvpDemo = {
  phase: '114.0';
  label: 'Gremium MVP Demo';
  demoId: string;
  userQuestion: string;
  flow: {
    step: string;
    result: string;
  }[];
  summary: CommitteeSessionSummary;
  finalAnswer: {
    headline: string;
    recommendation: string;
    risks: string[];
    actions: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeMvpDemo(question: string): CommitteeMvpDemo {
  const safeQuestion = question.trim() || 'Soll der Agent diese Entscheidung mit dem Gremium bewerten?';
  const summary = createCommitteeSessionSummary([
    safeQuestion,
    'Welche Risiken sieht das Gremium?',
    'Welche naechsten Aktionen empfiehlt das Gremium?',
  ]);

  return {
    phase: '114.0',
    label: 'Gremium MVP Demo',
    demoId: 'demo-114-0',
    userQuestion: safeQuestion,
    flow: [
      { step: '1 intake', result: 'User-Frage wurde dry-run-only angenommen.' },
      { step: '2 routing', result: 'Passende Gremiumsrollen wurden intern ausgewaehlt.' },
      { step: '3 deliberation', result: 'Rollenmeinungen wurden simuliert erzeugt.' },
      { step: '4 result', result: 'Entscheidung, Risiken und Aktionen wurden aggregiert.' },
      { step: '5 summary', result: 'Session-Zusammenfassung wurde erstellt.' },
    ],
    summary,
    finalAnswer: {
      headline: 'MVP-Demo erfolgreich erzeugt.',
      recommendation: summary.summary.decisions[0] ?? 'proceed-dry-run',
      risks: summary.summary.topRisks,
      actions: summary.summary.nextActions,
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeMvpDemo() {
  return createCommitteeMvpDemo('Soll der Gremium-Agent als MVP-Demo eine Frage komplett durch den internen Flow fuehren?');
}
