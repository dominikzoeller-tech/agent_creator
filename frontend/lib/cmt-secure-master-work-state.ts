export type SecureMasterWorkState = {
  localWorkReady: true;
  liveReady: false;
  providerAdapterNext: true;
  currentMainPage: '/cmt/master/secure/agent';
  userInstruction: string;
  nextThreshold: string;
  blockedLiveReasons: string[];
  safeNow: string[];
};

export const secureMasterWorkState: SecureMasterWorkState = {
  localWorkReady: true,
  liveReady: false,
  providerAdapterNext: true,
  currentMainPage: '/cmt/master/secure/agent',
  userInstruction: 'Jetzt lokal mit echten Fragen testen. Noch keine API-Keys eingeben und keine Live-KI aktivieren.',
  nextThreshold: 'Naechste Schwelle: deaktivierten Provider-Adapter vorbereiten, danach kontrollierten Live-Dry-Run planen.',
  blockedLiveReasons: [
    'kein echter Provider-Adapter aktiv',
    'keine Secret-Verwaltung aktiv',
    'keine Kosten-/Token-Bremse aktiv',
    'keine externe Datenschutzfreigabe aktiv',
  ],
  safeNow: [
    'lokal fragen',
    'Gremium lokal auswerten',
    'Privacy-Gate testen',
    'Provider-Dry-Run simulieren',
    'Adapter-Dry-Run simulieren',
    'Logs lokal exportieren',
  ],
};
