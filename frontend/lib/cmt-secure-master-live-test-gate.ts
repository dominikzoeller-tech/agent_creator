export type SecureMasterLiveTestGateResult = {
  ok: boolean;
  checkedAt: string;
  liveTestGatePrepared: true;
  canStartLiveTest: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  manualApprovalRequired: true;
  realSecretsRequiredServerSide: true;
  clientSecretsAllowed: false;
  requiredBeforeLiveTest: string[];
  blockedReasons: string[];
  nextSafeStep: string;
};

export function createSecureMasterLiveTestGateResult(): SecureMasterLiveTestGateResult {
  const blockedReasons = [
    'Provider ist noch nicht aktiv.',
    'Live-Modell ist noch nicht aktiv.',
    'Externe Weitergabe ist noch nicht freigegeben.',
    'Echte Secrets duerfen nicht im Client liegen.',
    'Manuelle Live-Test-Freigabe fehlt noch.',
  ];

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    liveTestGatePrepared: true,
    canStartLiveTest: false,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    manualApprovalRequired: true,
    realSecretsRequiredServerSide: true,
    clientSecretsAllowed: false,
    requiredBeforeLiveTest: [
      'Build muss gruen sein',
      'Secret/Git-Preflight muss gruen sein',
      'Budget-/Token-Limit muss gruen sein',
      'Audit-Verlauf muss funktionieren',
      'Serverseitiger Provider-Adapter muss vorhanden sein',
      'Provider-Key muss nur serverseitig in .env.local liegen',
      'Manueller Live-Test-Schalter muss explizit aktiviert werden',
      'Testfrage darf keine internen oder personenbezogenen Daten enthalten',
    ],
    blockedReasons,
    nextSafeStep: 'Jetzt ist die Live-Test-Schwelle vorbereitet. Naechster Patch darf den ersten echten Live-Test vorbereiten, aber nur mit serverseitigem ENV-Key und expliziter manueller Freigabe.',
  };
}
