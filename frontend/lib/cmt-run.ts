import { createCommitteeAskState, type CommitteeAskState } from './cmt-ask';

export type CommitteeRun = {
  phase: '112.1';
  label: 'Gremium Run';
  requestId: string;
  input: string;
  ask: CommitteeAskState;
  status: 'ready' | 'dry-run-complete';
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeRun(input: string): CommitteeRun {
  const safeInput = input.trim() || 'Welche Frage soll das Gremium bewerten?';
  return {
    phase: '112.1',
    label: 'Gremium Run',
    requestId: 'cr-demo-112-1',
    input: safeInput,
    ask: createCommitteeAskState(safeInput),
    status: 'dry-run-complete',
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeRunDemo() {
  return createCommitteeRun('Soll die UI eine Frage per Button an das Gremium senden und ein Ergebnis anzeigen?');
}
