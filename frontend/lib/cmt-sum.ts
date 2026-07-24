import { createCommitteeSavedSession, type CommitteeSavedSession } from './cmt-save';

export type CommitteeSessionSummary = {
  phase: '113.2';
  label: 'Gremium Summary';
  saved: CommitteeSavedSession;
  summary: {
    totalQuestions: number;
    decisions: string[];
    topRisks: string[];
    nextActions: string[];
    shortSummary: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeSessionSummary(questions: string[]): CommitteeSessionSummary {
  const saved = createCommitteeSavedSession(questions);
  const decisions = saved.history.items.map((item) => item.view.panels.decision);
  const topRisks = Array.from(new Set(saved.history.items.flatMap((item) => item.view.panels.risks))).slice(0, 6);
  const nextActions = Array.from(new Set(saved.history.items.flatMap((item) => item.view.panels.actions))).slice(0, 6);

  return {
    phase: '113.2',
    label: 'Gremium Summary',
    saved,
    summary: {
      totalQuestions: saved.savedCount,
      decisions,
      topRisks,
      nextActions,
      shortSummary: 'Die gespeicherte Gremium-Session wurde dry-run-only zusammengefasst.',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeSessionSummaryDemo() {
  return createCommitteeSessionSummary([
    'Soll der Agent gespeicherte Gremiumsfragen zusammenfassen?',
    'Welche Risiken sind ueber mehrere Fragen hinweg wichtig?',
    'Welche Aktionen sollen als naechstes umgesetzt werden?',
  ]);
}
