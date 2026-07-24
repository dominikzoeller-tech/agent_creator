import { getCommitteeHomeEntry, type CommitteeHomeEntry } from './cmt-home';

export type CommitteeAppEntry = {
  phase: '116.2';
  label: 'Gremium App Entry';
  home: CommitteeHomeEntry;
  appEntry: {
    title: string;
    href: string;
    badge: string;
    description: string;
    routes: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeAppEntry(): CommitteeAppEntry {
  const home = getCommitteeHomeEntry();
  return {
    phase: '116.2',
    label: 'Gremium App Entry',
    home,
    appEntry: {
      title: 'Gremium-Agent',
      href: '/cmt/home',
      badge: 'MVP dry-run-only',
      description: 'Haupt-App Einstieg fuer Navigation, Demo, Report, Share, Guide und Status.',
      routes: ['/cmt/home', '/cmt/nav', '/cmt/land', '/cmt/demo', '/cmt/demo/report', '/cmt/demo/share'],
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
