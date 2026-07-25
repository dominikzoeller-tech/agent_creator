export type SecureMasterSecretReadiness = {
  secretManagementPrepared: true;
  secretInputAllowed: false;
  browserSecretStorageAllowed: false;
  repoSecretStorageAllowed: false;
  envFileSecretStorageAllowedLater: boolean;
  secureVaultRequiredLater: true;
  providerCallAllowed: false;
  liveModelEnabled: false;
  requiredLater: string[];
  forbiddenNow: string[];
  nextSafeStep: string;
};

export const secureMasterSecretReadiness: SecureMasterSecretReadiness = {
  secretManagementPrepared: true,
  secretInputAllowed: false,
  browserSecretStorageAllowed: false,
  repoSecretStorageAllowed: false,
  envFileSecretStorageAllowedLater: false,
  secureVaultRequiredLater: true,
  providerCallAllowed: false,
  liveModelEnabled: false,
  requiredLater: [
    'Secret-Verwaltung ausserhalb Browser und Repo',
    'lokale .env nur mit klarer Git-Ignore-Pruefung',
    'keine Anzeige echter API-Keys im UI',
    'keine Speicherung echter API-Keys in localStorage',
    'Rotation/Reset-Moeglichkeit fuer Provider-Key',
    'Audit-Log ohne Secret-Werte',
  ],
  forbiddenNow: [
    'echte API-Keys in das Formular eingeben',
    'API-Keys im Browser speichern',
    'API-Keys ins Repository committen',
    'Provider-Call ohne Freigabe ausloesen',
    'interne Daten ohne Anonymisierung extern senden',
  ],
  nextSafeStep: 'Als naechstes Secret-Preflight und Git-Ignore-Pruefung vorbereiten. Noch keine echten Secrets verwenden.',
};
