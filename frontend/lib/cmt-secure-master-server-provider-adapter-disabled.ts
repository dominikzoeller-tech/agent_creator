export type SecureMasterServerProviderAdapterDisabled = {
  adapterPrepared: true;
  adapterEnabled: false;
  dispatchAllowed: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  secretsAccepted: false;
  endpointPath: '/api/cmt/master/secure/provider/adapter-disabled';
  blockedReason: string;
  nextSafeStep: string;
};

export const secureMasterServerProviderAdapterDisabled: SecureMasterServerProviderAdapterDisabled = {
  adapterPrepared: true,
  adapterEnabled: false,
  dispatchAllowed: false,
  providerCallAllowed: false,
  liveModelEnabled: false,
  externalSharingAllowed: false,
  secretsAccepted: false,
  endpointPath: '/api/cmt/master/secure/provider/adapter-disabled',
  blockedReason: 'Serverseitiger Provider-Adapter ist vorbereitet, aber hart deaktiviert. Kein Dispatch, kein Provider-Call, keine Secrets.',
  nextSafeStep: 'Als naechstes technische Secret/Git-Preflight-Pruefung vorbereiten. Danach Budget-/Token-Limit.',
};

export function createDisabledProviderAdapterResponse(inputPreview: string, approvalDecision: string) {
  return {
    ok: true,
    adapterPrepared: true,
    adapterEnabled: false,
    dispatchAllowed: false,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    secretsAccepted: false,
    requestPreview: {
      inputPreview: inputPreview.slice(0, 240),
      approvalDecision,
    },
    responseEnvelope: {
      status: 'adapter_disabled',
      message: 'Provider-Adapter-Codepfad erreicht, aber sicher blockiert. Kein Provider wurde aufgerufen.',
    },
    blockedReason: secureMasterServerProviderAdapterDisabled.blockedReason,
    nextSafeStep: secureMasterServerProviderAdapterDisabled.nextSafeStep,
  };
}
