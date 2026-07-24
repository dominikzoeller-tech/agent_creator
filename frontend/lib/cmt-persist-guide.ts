import { getCommitteePersistStatus, type CommitteePersistStatus } from './cmt-persist-status';

export type CommitteePersistGuide = {
  phase: '117.2';
  label: 'Gremium Persist Guide';
  status: CommitteePersistStatus;
  guide: {
    title: string;
    steps: string[];
    nextAdapterTargets: string[];
    blockedNow: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteePersistGuide(): CommitteePersistGuide {
  const status = getCommitteePersistStatus();
  return {
    phase: '117.2',
    label: 'Gremium Persist Guide',
    status,
    guide: {
      title: 'Persistenz-Adapter Guide',
      steps: [
        'Session-Struktur ueber cmt-save pruefen.',
        'Persist Adapter ueber cmt-persist pruefen.',
        'Persist Status ueber cmt-persist-status pruefen.',
        'Externe Speicherung erst nach expliziter Freigabe aktivieren.',
        'Storage-Calls weiter blockiert halten.',
      ],
      nextAdapterTargets: ['local-json', 'sqlite', 'server-db', 'encrypted-store'],
      blockedNow: ['externalStorageEnabled', 'networkCallAllowed', 'providerDispatchAllowed', 'finalDispatchBlocked'],
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
