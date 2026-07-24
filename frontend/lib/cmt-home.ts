import { getCommitteeMainNav, type CommitteeMainNav } from './cmt-nav';

export type CommitteeHomeEntry = {
  phase: '116.1';
  label: 'Gremium Home Entry';
  nav: CommitteeMainNav;
  entry: {
    title: string;
    description: string;
    href: string;
    cta: string;
    highlights: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeHomeEntry(): CommitteeHomeEntry {
  const nav = getCommitteeMainNav();
  return {
    phase: '116.1',
    label: 'Gremium Home Entry',
    nav,
    entry: {
      title: 'Gremium-Agent MVP',
      description: 'Schnelleinstieg zur dry-run-only Gremium-Demo direkt aus der Haupt-App.',
      href: '/cmt/nav',
      cta: 'Gremium-Agent oeffnen',
      highlights: [
        'MVP Landing erreichbar',
        'Demo Flow erreichbar',
        'Report und Share erreichbar',
        'Guide und Status erreichbar',
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
