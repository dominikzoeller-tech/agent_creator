import { createCommitteeView, type CommitteeView } from './cmt-view';

export type CommitteeHistoryItem = {
  id: string;
  title: string;
  question: string;
  createdAt: string;
  view: CommitteeView;
};

export type CommitteeHistory = {
  phase: '113.0';
  label: 'Gremium History';
  items: CommitteeHistoryItem[];
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeHistory(questions: string[]): CommitteeHistory {
  const safeQuestions = questions.length > 0 ? questions : [
    'Soll das Gremium die Entscheidung bewerten?',
    'Welche Risiken sieht das Gremium?',
    'Welche naechsten Schritte empfiehlt das Gremium?',
  ];

  return {
    phase: '113.0',
    label: 'Gremium History',
    items: safeQuestions.map((question, index) => ({
      id: 'ch-demo-113-0-' + String(index + 1),
      title: 'Gremiumsfrage ' + String(index + 1),
      question,
      createdAt: 'dry-run',
      view: createCommitteeView(question),
    })),
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeHistoryDemo() {
  return createCommitteeHistory([
    'Soll der Agent einen Verlauf fuer Gremiumsfragen anzeigen?',
    'Welche Risiken muss der Verlauf beachten?',
    'Welche naechsten Schritte braucht der MVP?',
  ]);
}
