import { createCommitteeBrief, type CommitteeBrief } from './cmt-brief';

export type CommitteeAskState = {
  phase: '112.0';
  label: 'Gremium Ask UI';
  inputPlaceholder: string;
  sampleQuestion: string;
  result: CommitteeBrief;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeAskState(question: string): CommitteeAskState {
  const safeQuestion = question.trim() || 'Soll ich diese Entscheidung mit dem Gremium bewerten?';
  return {
    phase: '112.0',
    label: 'Gremium Ask UI',
    inputPlaceholder: 'Stelle dem Gremium eine Frage...',
    sampleQuestion: safeQuestion,
    result: createCommitteeBrief(safeQuestion),
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeAskDemo() {
  return createCommitteeAskState('Soll der Agent eine echte Eingabe-UI fuer Nutzerfragen an das Gremium anzeigen?');
}
