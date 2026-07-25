export type SecureMasterServerProviderDryRunContract = {
  endpointPrepared: true;
  endpointPath: '/api/cmt/master/secure/provider/dry-run';
  method: 'POST';
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  secretsAccepted: false;
  dryRunOnly: true;
  blockedReason: string;
  nextSafeStep: string;
};

export const secureMasterServerProviderDryRunContract: SecureMasterServerProviderDryRunContract = {
  endpointPrepared: true,
  endpointPath: '/api/cmt/master/secure/provider/dry-run',
  method: 'POST',
  providerCallAllowed: false,
  liveModelEnabled: false,
  externalSharingAllowed: false,
  secretsAccepted: false,
  dryRunOnly: true,
  blockedReason: 'Server-Dry-Run ist vorbereitet, echter Provider-Call bleibt blockiert. Keine echten Secrets werden akzeptiert.',
  nextSafeStep: 'Als naechstes Client-Testbutton fuer den Server-Dry-Run verbinden und danach Audit-Envelope vorbereiten.',
};

export function createSecureMasterServerProviderDryRunEnvelope(inputPreview: string, approvalDecision: string) {
  return {
    ok: true,
    endpointPrepared: true,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    secretsAccepted: false,
    dryRunOnly: true,
    requestPreview: {
      inputPreview: inputPreview.slice(0, 240),
      approvalDecision,
    },
    responsePreview: {
      status: 'blocked_server_dry_run',
      message: 'Server-Dry-Run erfolgreich simuliert. Kein Provider wurde aufgerufen.',
    },
    blockedReason: secureMasterServerProviderDryRunContract.blockedReason,
    nextSafeStep: secureMasterServerProviderDryRunContract.nextSafeStep,
  };
}
