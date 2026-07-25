export type ProviderGateStatus = {
  providerEnabled: false;
  internetEnabled: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  approvalRequired: true;
  anonymizationRequiredForInternalData: true;
  readyForLiveModel: false;
  nextReadinessStep: string;
  requirements: string[];
};

export const secureMasterProviderGateStatus: ProviderGateStatus = {
  providerEnabled: false,
  internetEnabled: false,
  liveModelEnabled: false,
  externalSharingAllowed: false,
  approvalRequired: true,
  anonymizationRequiredForInternalData: true,
  readyForLiveModel: false,
  nextReadinessStep: 'Build stabil halten, lokale Testfragen prüfen, Datenschutz-Gate bestätigen, danach Provider-Konfiguration vorbereiten.',
  requirements: [
    'Explizite Freigabe vor Provider-Nutzung',
    'Anonymisierung bei internen oder personenbezogenen Daten',
    'Kein automatischer Internetzugriff',
    'Kosten-/Token-Limit vor Live-Schaltung',
    'Audit-Log für jede externe Anfrage',
  ],
};
