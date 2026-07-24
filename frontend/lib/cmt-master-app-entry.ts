import { getSecureMasterNavStatus, type SecureMasterNavStatus } from './cmt-master-nav-status';

export type SecureMasterAppEntry = {
  phase: '123.2';
  label: 'Secure Master App Entry';
  nav: SecureMasterNavStatus;
  appEntry: {
    title: 'Secure Master Agent';
    subtitle: string;
    primaryHref: '/cmt/master/secure';
    secondaryHref: '/cmt/master/home';
    statusHref: '/cmt/master/nav/status';
    guideHref: '/cmt/master/secure/guide';
    recommendedBookmark: 'http://localhost:3001/cmt/master/secure';
  };
  visibleLinks: string[];
  status: {
    localTestable: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterAppEntry(): SecureMasterAppEntry {
  return {
    phase: '123.2',
    label: 'Secure Master App Entry',
    nav: getSecureMasterNavStatus(),
    appEntry: {
      title: 'Secure Master Agent',
      subtitle: 'Zentraler lokaler Einstieg fuer Master-Agent, Privacy-Gate und Gremium-Routing.',
      primaryHref: '/cmt/master/secure',
      secondaryHref: '/cmt/master/home',
      statusHref: '/cmt/master/nav/status',
      guideHref: '/cmt/master/secure/guide',
      recommendedBookmark: 'http://localhost:3001/cmt/master/secure',
    },
    visibleLinks: [
      '/cmt/master/secure',
      '/cmt/master/home',
      '/cmt/master/nav/status',
      '/cmt/master/secure/guide',
      '/cmt/privacy',
      '/cmt/ask',
    ],
    status: {
      localTestable: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 123.3: Secure Master Entry Handoff',
  };
}
