export type SecureMasterEnvPreflight = {
  envPreflightPrepared: true;
  realSecretsAllowedNow: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  requiredFilesLater: string[];
  gitIgnorePatternsRequired: string[];
  checks: { id: string; label: string; status: 'prepared' | 'blocked'; detail: string }[];
  nextSafeStep: string;
};

export const secureMasterEnvPreflight: SecureMasterEnvPreflight = {
  envPreflightPrepared: true,
  realSecretsAllowedNow: false,
  providerCallAllowed: false,
  liveModelEnabled: false,
  requiredFilesLater: ['.env.local', '.gitignore', 'server-side provider config'],
  gitIgnorePatternsRequired: ['.env', '.env.*', '!.env.example', '*.key', '*secret*'],
  checks: [
    { id: 'no_real_keys', label: 'Keine echten API-Keys im UI', status: 'blocked', detail: 'Echte API-Keys duerfen aktuell nicht eingegeben werden.' },
    { id: 'no_browser_secret', label: 'Keine Secrets in localStorage', status: 'blocked', detail: 'Browser-Speicherung echter Secrets bleibt verboten.' },
    { id: 'gitignore', label: '.gitignore muss Secrets ausschliessen', status: 'prepared', detail: 'Vor Live-KI muss .gitignore auf .env und Secret-Dateien geprueft werden.' },
    { id: 'env_example', label: '.env.example spaeter erlaubt', status: 'prepared', detail: 'Nur Platzhalter ohne echte Werte duerfen versioniert werden.' },
    { id: 'server_only', label: 'Provider-Key nur serverseitig', status: 'prepared', detail: 'Ein echter Provider-Key darf spaeter nur serverseitig gelesen werden.' },
  ],
  nextSafeStep: 'Als naechstes .env.example und serverseitigen Config-Stub vorbereiten. Keine echten Secrets eintragen.',
};
