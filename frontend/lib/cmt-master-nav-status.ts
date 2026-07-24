import { getSecureMasterHome, type SecureMasterHome } from './cmt-master-home';

export type SecureMasterNavStatus = {
  phase: '123.1';
  label: 'Secure Master Navigation Status';
  home: SecureMasterHome;
  navigationState: {
    primaryEntryVisible: true;
    primaryEntry: '/cmt/master/secure';
    homeEntry: '/cmt/master/home';
    statusEntry: '/cmt/master/secure/status';
    guideEntry: '/cmt/master/secure/guide';
    recommendedDefaultPage: '/cmt/master/secure';
    message: string;
  };
  routeMap: {
    secureMaster: '/cmt/master/secure';
    secureMasterHome: '/cmt/master/home';
    secureMasterStatus: '/cmt/master/secure/status';
    secureMasterGuide: '/cmt/master/secure/guide';
    privacyGate: '/cmt/privacy';
    privacyDecision: '/cmt/privacy/decision';
    committeeAsk: '/cmt/ask';
  };
  safety: {
    localTestable: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterNavStatus(): SecureMasterNavStatus {
  return {
    phase: '123.1',
    label: 'Secure Master Navigation Status',
    home: getSecureMasterHome(),
    navigationState: {
      primaryEntryVisible: true,
      primaryEntry: '/cmt/master/secure',
      homeEntry: '/cmt/master/home',
      statusEntry: '/cmt/master/secure/status',
      guideEntry: '/cmt/master/secure/guide',
      recommendedDefaultPage: '/cmt/master/secure',
      message: 'Der Secure Master Agent ist der zentrale lokale Einstieg. Noch nicht live mit KI-Modell.',
    },
    routeMap: {
      secureMaster: '/cmt/master/secure',
      secureMasterHome: '/cmt/master/home',
      secureMasterStatus: '/cmt/master/secure/status',
      secureMasterGuide: '/cmt/master/secure/guide',
      privacyGate: '/cmt/privacy',
      privacyDecision: '/cmt/privacy/decision',
      committeeAsk: '/cmt/ask',
    },
    safety: {
      localTestable: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 123.2: Secure Master als App-Entry verlinken',
  };
}
