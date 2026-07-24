import { getCommitteePersistGuide, type CommitteePersistGuide } from './cmt-persist-guide';
import { getCommitteePersistAdapterDemo, type CommitteePersistAdapter } from './cmt-persist';

export type CommitteeLocalJsonPlan = {
  phase: '118.0';
  label: 'Gremium Local JSON Plan';
  guide: CommitteePersistGuide;
  persist: CommitteePersistAdapter;
  localJson: {
    target: 'local-json';
    fileName: string;
    directory: string;
    writeMode: 'planned-only';
    schemaVersion: '1';
    externalStorageEnabled: false;
    actualFileWriteEnabled: false;
    plannedPayload: {
      sessionKey: string;
      savedCount: number;
      questions: string[];
    };
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeLocalJsonPlan(): CommitteeLocalJsonPlan {
  const guide = getCommitteePersistGuide();
  const persist = getCommitteePersistAdapterDemo();
  return {
    phase: '118.0',
    label: 'Gremium Local JSON Plan',
    guide,
    persist,
    localJson: {
      target: 'local-json',
      fileName: persist.persisted.key + '.json',
      directory: '.data/cmt-sessions',
      writeMode: 'planned-only',
      schemaVersion: '1',
      externalStorageEnabled: false,
      actualFileWriteEnabled: false,
      plannedPayload: {
        sessionKey: persist.persisted.key,
        savedCount: persist.persisted.itemCount,
        questions: persist.session.history.items.map((item) => item.question),
      },
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
