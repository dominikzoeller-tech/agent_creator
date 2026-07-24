import { getCommitteeLanding, type CommitteeLanding } from './cmt-land';

export type CommitteeMainNav = {
  phase: '116.0';
  label: 'Gremium Main Navigation';
  landing: CommitteeLanding;
  nav: {
    title: string;
    items: {
      label: string;
      href: string;
      kind: 'primary' | 'secondary';
    }[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeMainNav(): CommitteeMainNav {
  const landing = getCommitteeLanding();
  return {
    phase: '116.0',
    label: 'Gremium Main Navigation',
    landing,
    nav: {
      title: 'Gremium-Agent',
      items: [
        { label: 'MVP Landing', href: '/cmt/land', kind: 'primary' },
        { label: 'Demo', href: '/cmt/demo', kind: 'primary' },
        { label: 'Report', href: '/cmt/demo/report', kind: 'secondary' },
        { label: 'Share', href: '/cmt/demo/share', kind: 'secondary' },
        { label: 'Guide', href: '/cmt/land/guide', kind: 'secondary' },
        { label: 'Status', href: '/cmt/land/status', kind: 'secondary' },
      ],
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
