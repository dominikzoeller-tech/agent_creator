export type SecureMasterLiveGateCheck = {
  liveGatePrepared: true;
  buildMustBeGreen: true;
  approvalMustBeExplicit: true;
  privacyMustAllowExternal: false;
  providerCallAllowed: false;
  liveModelAllowed: false;
  currentDecisionAllowedForLive: false;
  blockedReason: string;
  nextMilestone: string;
};

export const secureMasterLiveGateCheck: SecureMasterLiveGateCheck = {
  liveGatePrepared: true,
  buildMustBeGreen: true,
  approvalMustBeExplicit: true,
  privacyMustAllowExternal: false,
  providerCallAllowed: false,
  liveModelAllowed: false,
  currentDecisionAllowedForLive: false,
  blockedReason: 'Live-KI ist blockiert: Es gibt noch keinen echten Provider-Adapter, keine Secret-Verwaltung, keine Kostenbremse und keine externe Datenschutzfreigabe.',
  nextMilestone: 'Naechster sinnvoller Schritt: Live-Gate technisch weiter vorbereiten, danach erst einen kontrollierten lokalen Provider-Dry-Run bauen.',
};
