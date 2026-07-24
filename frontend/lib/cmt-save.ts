import { createCommitteeHistory, type CommitteeHistory } from './cmt-hist';

export type CommitteeSavedSession = {
  phase: '113.1';
  label: 'Gremium Save';
  sessionKey: string;
  history: CommitteeHistory;
  savedCount: number;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeSavedSession(questions: string[]): CommitteeSavedSession {
  const history = createCommitteeHistory(questions);
  return {
    phase: '113.1',
    label: 'Gremium Save',
    sessionKey: 'csave-demo-113-1',
    history,
    savedCount: history.items.length,
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeSavedSessionDemo() {
  return createCommitteeSavedSession([
    'Soll der Agent Gremiumsfragen als Session speichern?',
    'Welche Entscheidung wurde zuletzt bewertet?',
    'Welche Aktion soll als naechstes umgesetzt werden?',
  ]);
}
