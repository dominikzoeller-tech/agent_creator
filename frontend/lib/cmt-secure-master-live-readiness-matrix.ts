export type SecureMasterLiveReadinessItem = {
  id: string;
  label: string;
  ready: boolean;
  requiredForLive: true;
  detail: string;
};

export type SecureMasterLiveReadinessMatrix = {
  canGoLive: false;
  localMvpReady: true;
  providerLiveBlocked: true;
  items: SecureMasterLiveReadinessItem[];
  missingCriticalCount: number;
  nextSafeStep: string;
};

export function createSecureMasterLiveReadinessMatrix(params: {
  hasAdapterContract: boolean;
  hasAdapterPipeline: boolean;
  approvalDecision: string;
  providerCallAllowed: boolean;
}): SecureMasterLiveReadinessMatrix {
  const items: SecureMasterLiveReadinessItem[] = [
    {
      id: 'build',
      label: 'Build stabil',
      ready: true,
      requiredForLive: true,
      detail: 'Build muss gruen sein, bevor Live-KI aktiviert wird.',
    },
    {
      id: 'privacy_gate',
      label: 'Privacy-Gate sichtbar',
      ready: true,
      requiredForLive: true,
      detail: 'Interne Daten muessen erkannt und externe Weitergabe muss blockierbar sein.',
    },
    {
      id: 'approval',
      label: 'Explizite Freigabe',
      ready: params.approvalDecision !== 'cancel',
      requiredForLive: true,
      detail: 'Nutzerfreigabe muss vor externer Verarbeitung vorhanden sein.',
    },
    {
      id: 'adapter_contract',
      label: 'Provider-Adapter-Contract',
      ready: params.hasAdapterContract,
      requiredForLive: true,
      detail: 'Deaktivierter Adapter-Contract muss lokal getestet sein.',
    },
    {
      id: 'adapter_pipeline',
      label: 'Provider-Adapter-Pipeline',
      ready: params.hasAdapterPipeline,
      requiredForLive: true,
      detail: 'Pipeline muss prepare, validate, approve und dispatch_blocked abbilden.',
    },
    {
      id: 'secret_management',
      label: 'Secret-Verwaltung',
      ready: false,
      requiredForLive: true,
      detail: 'API-Keys duerfen nicht im Browser oder Repo gespeichert werden.',
    },
    {
      id: 'budget_limit',
      label: 'Kosten-/Token-Limit',
      ready: false,
      requiredForLive: true,
      detail: 'Vor Live-KI braucht es ein Kosten- und Tokenlimit.',
    },
    {
      id: 'audit_log',
      label: 'Audit-Log fuer externe Calls',
      ready: false,
      requiredForLive: true,
      detail: 'Jeder echte Provider-Call muss protokolliert werden.',
    },
    {
      id: 'provider_call',
      label: 'Provider-Call erlaubt',
      ready: params.providerCallAllowed,
      requiredForLive: true,
      detail: 'Bleibt aktuell bewusst false.',
    },
  ];

  const missingCriticalCount = items.filter((item) => item.requiredForLive && !item.ready).length;

  return {
    canGoLive: false,
    localMvpReady: true,
    providerLiveBlocked: true,
    items,
    missingCriticalCount,
    nextSafeStep: 'Weiter lokal testen. Danach Secret-Verwaltung, Kostenlimit und Audit-Log vorbereiten. Erst dann Live-KI diskutieren.',
  };
}
