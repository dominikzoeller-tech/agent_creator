export type SecureMasterActionPlan = {
  headline: string;
  summary: string;
  steps: string[];
  liveBoundary: string;
  providerCallAllowed: false;
  dryRunOnly: true;
};

export function createSecureMasterActionPlan(params: {
  intent?: string;
  route?: string;
  privacyDecision?: string;
  approvalDecision?: string;
  hasProviderDryRun?: boolean;
}): SecureMasterActionPlan {
  const intent = params.intent ?? 'general';
  const route = params.route ?? 'direct';
  const privacy = params.privacyDecision ?? 'allow_local_only';
  const approval = params.approvalDecision ?? 'local_only';
  const hasDryRun = Boolean(params.hasProviderDryRun);

  if (privacy === 'block_external' || approval === 'cancel') {
    return {
      headline: 'Sicher stoppen und lokal bleiben',
      summary: 'Die Eingabe ist zu sensibel oder wurde abgebrochen. Keine externe Verarbeitung.',
      steps: ['Eingabe lokal pruefen', 'sensible Bestandteile markieren', 'keinen Provider-Dry-Run ausfuehren', 'bei Bedarf anonymisierte Version erstellen'],
      liveBoundary: 'Live-KI bleibt blockiert.',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  if (route === 'privacy_gate') {
    return {
      headline: 'Datenschutz zuerst',
      summary: 'Interne oder geschaeftliche Daten erkannt. Der sichere Weg ist lokale Verarbeitung oder Anonymisierung.',
      steps: ['lokale Antwort bewerten', 'interne Details entfernen oder anonymisieren', 'Freigabeentscheidung local_only bevorzugen', 'erst spaeter anonymize_then_send pruefen'],
      liveBoundary: 'Keine externe Weitergabe ohne explizite Freigabe und Anonymisierung.',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  if (route === 'tool_required') {
    return {
      headline: hasDryRun ? 'Dry-Run auswerten' : 'Provider-Dry-Run sinnvoll',
      summary: 'Die Frage braucht wahrscheinlich aktuelle Daten oder ein Modell. Aktuell darf nur simuliert werden.',
      steps: hasDryRun
        ? ['Dry-Run-Ergebnis pruefen', 'fehlende Datenquelle benennen', 'Provider-Gate noch nicht aktivieren', 'spaeter echten Adapter vorbereiten']
        : ['Provider-Dry-Run simulieren', 'fehlende Datenquelle dokumentieren', 'keinen echten Call erlauben', 'spaeter Adapter-Plan erstellen'],
      liveBoundary: 'Provider-Dry-Run ist erlaubt, echter Provider-Call nicht.',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  if (route === 'committee' || intent === 'live_switch' || intent === 'improvement') {
    return {
      headline: 'Gremiumsausgabe nutzen',
      summary: 'Die Frage betrifft Entscheidung, Verbesserung, Risiko oder Live-Schaltung.',
      steps: ['Gremiumsargumente lesen', 'Risiken markieren', 'naechste konkrete Umsetzung waehlen', 'Live-KI erst nach stabilem Gate vorbereiten'],
      liveBoundary: 'Live-Schaltung jetzt noch nicht freigeben.',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  return {
    headline: 'Lokal beantworten und protokollieren',
    summary: 'Die Frage kann lokal eingeordnet werden.',
    steps: ['lokale Antwort pruefen', 'Verlauf speichern', 'bei Unsicherheit Gremium nutzen', 'bei Toolbedarf Dry-Run testen'],
    liveBoundary: 'Keine externe Verarbeitung erforderlich.',
    providerCallAllowed: false,
    dryRunOnly: true,
  };
}
