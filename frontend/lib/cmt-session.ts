import { createCommitteeDeliberation, type CommitteeDeliberation } from './cmt-delib';

export type CommitteeSession = {
  phase: '111.0';
  label: 'User Frage Session';
  sessionId: string;
  userQuestion: string;
  status: 'draft' | 'ready' | 'dry-run-complete';
  deliberation: CommitteeDeliberation;
  createdAt: string;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeSession(userQuestion: string): CommitteeSession {
  const safeQuestion = userQuestion.trim() || 'Welche Entscheidung soll das Gremium bewerten?';
  return {
    phase: '111.0',
    label: 'User Frage Session',
    sessionId: 'cs-demo-111-0',
    userQuestion: safeQuestion,
    status: 'dry-run-complete',
    deliberation: createCommitteeDeliberation(safeQuestion),
    createdAt: 'dry-run',
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeSessionDemo() {
  return createCommitteeSession('Soll der Agent diese Nutzerfrage an ein internes Gremium geben und eine erste Empfehlung anzeigen?');
}
