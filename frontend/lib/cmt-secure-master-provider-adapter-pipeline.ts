export type SecureMasterProviderPipelineStage = {
  id: 'prepare' | 'validate' | 'approve' | 'dispatch_blocked';
  label: string;
  status: 'ready' | 'prepared' | 'blocked';
  detail: string;
};

export type SecureMasterProviderAdapterPipeline = {
  pipelinePrepared: true;
  dryRunOnly: true;
  providerCallAllowed: false;
  adapterDispatchAllowed: false;
  currentStage: 'dispatch_blocked';
  stages: SecureMasterProviderPipelineStage[];
  nextSafeStep: string;
};

export function createSecureMasterProviderAdapterPipeline(params: {
  approvalDecision: string;
  privacyDecision?: string;
  hasAdapterContract: boolean;
}): SecureMasterProviderAdapterPipeline {
  const privacy = params.privacyDecision ?? 'allow_local_only';
  const approval = params.approvalDecision;
  const privacyBlocked = privacy !== 'allow_local_only' || approval === 'cancel';

  return {
    pipelinePrepared: true,
    dryRunOnly: true,
    providerCallAllowed: false,
    adapterDispatchAllowed: false,
    currentStage: 'dispatch_blocked',
    stages: [
      {
        id: 'prepare',
        label: 'Adapter vorbereiten',
        status: params.hasAdapterContract ? 'prepared' : 'ready',
        detail: params.hasAdapterContract ? 'Adapter-Contract liegt lokal vor.' : 'Adapter-Contract kann lokal erstellt werden.',
      },
      {
        id: 'validate',
        label: 'Validieren',
        status: 'prepared',
        detail: privacyBlocked ? 'Validierung erkennt Datenschutz-/Freigabegrenze.' : 'Validierung kann lokal simuliert werden.',
      },
      {
        id: 'approve',
        label: 'Freigabe pruefen',
        status: approval === 'local_only' ? 'prepared' : 'blocked',
        detail: approval === 'local_only' ? 'Lokale Freigabe aktiv. Externe Freigabe nicht aktiv.' : 'Externe Freigabe fehlt oder Abbruch gewaehlt.',
      },
      {
        id: 'dispatch_blocked',
        label: 'Dispatch blockiert',
        status: 'blocked',
        detail: 'Provider-Dispatch bleibt blockiert. Kein API-Key, kein Live-Schalter, kein externer Call.',
      },
    ],
    nextSafeStep: 'Als naechstes einen deaktivierten Provider-Adapter-Codepfad mit Tests vorbereiten. Live-Call bleibt aus.',
  };
}
