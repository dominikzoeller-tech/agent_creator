import { getCommitteeLanding, type CommitteeLanding } from './cmt-land';

export type CommitteeLandingStatus = {
  phase: '115.1';
  label: 'Gremium Landing Status';
  landing: CommitteeLanding;
  status: {
    ready: true;
    pages: string[];
    apiRoutes: string[];
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

export function getCommitteeLandingStatus(): CommitteeLandingStatus {
  const landing = getCommitteeLanding();
  return {
    phase: '115.1',
    label: 'Gremium Landing Status',
    landing,
    status: {
      ready: true,
      pages: landing.links.map((link) => link.href),
      apiRoutes: ['/api/cmt/land', '/api/cmt/demo', '/api/cmt/demo/report', '/api/cmt/demo/share'],
      checks: [
        'Landing Page vorhanden',
        'Demo Page verlinkt',
        'Report Page verlinkt',
        'Share Page verlinkt',
        'Safety State dry-run-only',
      ],
      summary: 'Die MVP-Landing ist bereit und verlinkt Demo, Report, Share und Session Summary.',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
