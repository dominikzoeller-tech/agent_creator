import { getCommitteePersistAdapterDemo, type CommitteePersistAdapter } from './cmt-persist';

export type CommitteePersistStatus = {
  phase: '117.1';
  label: 'Gremium Persist Status';
  persist: CommitteePersistAdapter;
  status: {
    ready: true;
    adapterKind: 'memory-dry-run';
    storageEnabled: false;
    checks: string[];
    summary: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteePersistStatus(): CommitteePersistStatus {
  const persist = getCommitteePersistAdapterDemo();
  return {
    phase: '117.1',
    label: 'Gremium Persist Status',
    persist,
    status: {
      ready: true,
      adapterKind: 'memory-dry-run',
      storageEnabled: false,
      checks: [
        'Persist Adapter vorhanden',
        'Session-Key vorbereitet',
        'Item-Count vorbereitet',
        'Externe Speicherung deaktiviert',
        'Safety State dry-run-only',
      ],
      summary: 'Der Persistenz-Adapter ist vorbereitet, speichert aber noch nicht extern.',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
