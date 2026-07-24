import { createCommitteeSavedSession, type CommitteeSavedSession } from './cmt-save';

export type CommitteePersistAdapter = {
  phase: '117.0';
  label: 'Gremium Persist Adapter';
  adapter: {
    kind: 'memory-dry-run';
    canRead: true;
    canWrite: true;
    externalStorageEnabled: false;
    storageTarget: 'none';
  };
  session: CommitteeSavedSession;
  persisted: {
    key: string;
    itemCount: number;
    status: 'prepared';
    note: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteePersistAdapter(questions: string[]): CommitteePersistAdapter {
  const session = createCommitteeSavedSession(questions);
  return {
    phase: '117.0',
    label: 'Gremium Persist Adapter',
    adapter: {
      kind: 'memory-dry-run',
      canRead: true,
      canWrite: true,
      externalStorageEnabled: false,
      storageTarget: 'none',
    },
    session,
    persisted: {
      key: session.sessionKey,
      itemCount: session.savedCount,
      status: 'prepared',
      note: 'Persistenz ist vorbereitet, aber noch nicht an externe Speicherung angebunden.',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteePersistAdapterDemo() {
  return createCommitteePersistAdapter([
    'Soll der Gremium-Agent Sessions vorbereiten und speichern?',
    'Welche Daten sollen spaeter persistent werden?',
    'Welche Safety-Grenzen gelten fuer Speicheradapter?',
  ]);
}
