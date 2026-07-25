export type SecureMasterRecommendation = 'local_answer' | 'committee' | 'provider_dry_run' | 'blocked';

export type SecureMasterDecisionSummary = {
  recommendation: SecureMasterRecommendation;
  title: string;
  reason: string;
  nextBestAction: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  providerCallAllowed: false;
  dryRunOnly: true;
};

export function createSecureMasterDecisionSummary(params: {
  intent?: string;
  route?: string;
  privacyDecision?: string;
  approvalDecision?: string;
}): SecureMasterDecisionSummary {
  const intent = params.intent ?? 'general';
  const route = params.route ?? 'direct';
  const privacy = params.privacyDecision ?? 'allow_local_only';
  const approval = params.approvalDecision ?? 'local_only';

  if (privacy === 'block_external' || approval === 'cancel') {
    return {
      recommendation: 'blocked',
      title: 'Blockiert / nur lokal behandeln',
      reason: 'Sensible Inhalte oder Abbruchentscheidung erkannt. Keine externe Weitergabe zulassen.',
      nextBestAction: 'Eingabe lokal prüfen, sensible Bestandteile markieren und keine Provider-Schicht verwenden.',
      riskLevel: 'critical',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  if (route === 'privacy_gate') {
    return {
      recommendation: 'blocked',
      title: 'Datenschutz-Gate aktiv',
      reason: 'Interne oder geschäftliche Daten erkannt. Externe Verarbeitung bleibt blockiert.',
      nextBestAction: 'Lokal antworten oder anonymisierte Variante vorbereiten, aber noch nicht senden.',
      riskLevel: 'high',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  if (route === 'tool_required') {
    return {
      recommendation: 'provider_dry_run',
      title: 'Tool oder Provider waere spaeter noetig',
      reason: 'Die Frage braucht wahrscheinlich aktuelle Daten, Internet oder ein externes Modell.',
      nextBestAction: 'Provider-Dry-Run nutzen, um den spaeteren Ablauf zu testen. Kein echter Call.',
      riskLevel: 'medium',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  if (route === 'committee' || intent === 'live_switch' || intent === 'improvement') {
    return {
      recommendation: 'committee',
      title: 'Gremium sinnvoll',
      reason: 'Die Frage betrifft Entscheidung, Risiko, Verbesserung oder Live-Schaltung.',
      nextBestAction: 'Gremiumsausgabe nutzen, lokale Tests fortsetzen und Live-KI noch nicht aktivieren.',
      riskLevel: 'medium',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  return {
    recommendation: 'local_answer',
    title: 'Lokale Antwort reicht vorerst',
    reason: 'Keine externe Datenquelle und kein Live-Modell erforderlich.',
    nextBestAction: 'Lokale Antwort nutzen, Verlauf speichern und bei Unsicherheit Gremium einschalten.',
    riskLevel: 'low',
    providerCallAllowed: false,
    dryRunOnly: true,
  };
}
