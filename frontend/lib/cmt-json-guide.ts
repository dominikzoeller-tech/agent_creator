import { getCommitteeLocalJsonStatus, type CommitteeLocalJsonStatus } from './cmt-json-status';

export type CommitteeLocalJsonGuide = {
  phase: '118.2';
  label: 'Gremium Local JSON Guide';
  status: CommitteeLocalJsonStatus;
  guide: {
    title: string;
    steps: string[];
    plannedFiles: string[];
    blockedNow: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeLocalJsonGuide(): CommitteeLocalJsonGuide {
  const status = getCommitteeLocalJsonStatus();
  return {
    phase: '118.2',
    label: 'Gremium Local JSON Guide',
    status,
    guide: {
      title: 'Local JSON Ausbau Guide',
      steps: [
        'Local JSON Plan pruefen.',
        'Local JSON Status pruefen.',
        'Zielordner und Dateiname validieren.',
        'Payload-Schema pruefen.',
        'Echte Datei-Schreibvorgaenge erst nach expliziter Freigabe aktivieren.',
      ],
      plannedFiles: [
        status.plan.localJson.directory + '/' + status.plan.localJson.fileName,
        status.plan.localJson.directory + '/index.json',
        status.plan.localJson.directory + '/README.md',
      ],
      blockedNow: ['actualFileWriteEnabled', 'externalStorageEnabled', 'networkCallAllowed', 'providerDispatchAllowed'],
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
