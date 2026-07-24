import { getCommitteeLandingStatus, type CommitteeLandingStatus } from './cmt-land-status';

export type CommitteeLandingGuide = {
  phase: '115.2';
  label: 'Gremium Landing Guide';
  status: CommitteeLandingStatus;
  guide: {
    title: string;
    steps: string[];
    demoPath: string;
    reportPath: string;
    sharePath: string;
    statusPath: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeLandingGuide(): CommitteeLandingGuide {
  const status = getCommitteeLandingStatus();
  return {
    phase: '115.2',
    label: 'Gremium Landing Guide',
    status,
    guide: {
      title: 'Gremium MVP Demo Guide',
      steps: [
        'Landing Page oeffnen.',
        'Demo starten und eine Testfrage eingeben.',
        'Report pruefen.',
        'Share-Kurzfassung erzeugen.',
        'Statusseite pruefen.',
      ],
      demoPath: '/cmt/demo',
      reportPath: '/cmt/demo/report',
      sharePath: '/cmt/demo/share',
      statusPath: '/cmt/land/status',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
