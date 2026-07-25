export type AgentRoute = 'direct' | 'committee' | 'privacy_gate' | 'tool_required' | 'agent_builder';
export type AgentIntent = 'general' | 'live_switch' | 'internal_data' | 'committee_decision' | 'tool_required' | 'agent_builder' | 'project_next_step' | 'improvement';
export type PrivacyDecision = 'allow_local_only' | 'require_anonymization' | 'block_external';

export type AgentLog = {
  id: string;
  createdAt: string;
  input: string;
  inputPreview: string;
  intent: AgentIntent;
  route: AgentRoute;
  privacyDecision: PrivacyDecision;
  confidence: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
  liveReadiness: 'not_ready' | 'prepare_gate' | 'blocked_by_privacy' | 'tool_required_first';
  modeLabel: string;
  answer: string;
  reason: string;
  nextSteps: string[];
  committee: { role: string; focus: string; opinion: string }[];
};

export const SECURE_MASTER_AGENT_LOG_KEY = 'cmt.secureMaster.agent.mvp.logs.v2';

const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

function detectIntent(input: string): AgentIntent {
  const value = input.toLowerCase();
  if (includesAny(value, ['wetter', 'news', 'aktuell', 'kurs', 'preis', 'internet', 'recherchier', 'suche im web', 'google'])) return 'tool_required';
  if (includesAny(value, ['kunde', 'kundendaten', 'intern', 'vertraulich', 'geheim', 'angebot', 'kalkulation', 'mitarbeiter', 'personenbezogen', 'vertrag', 'rechnung'])) return 'internal_data';
  if (includesAny(value, ['agent bauen', 'agenten bauen', 'spezialagent', 'trading agent', 'immobilien agent', 'bauleiter entlasten', 'automatisieren'])) return 'agent_builder';
  if (includesAny(value, ['live schalten', 'aktivieren', 'provider', 'ki-modell', 'modell anschließen', 'modell anschliessen', 'openai', 'azure'])) return 'live_switch';
  if (includesAny(value, ['verbessern', 'besser machen', 'qualität', 'antwortqualität', 'ui verbessern', 'optimieren'])) return 'improvement';
  if (includesAny(value, ['soll ich', 'sollen wir', 'entscheidung', 'priorisieren', 'strategie', 'risiko', 'gremium', 'bewerten'])) return 'committee_decision';
  if (includesAny(value, ['nächster schritt', 'naechster schritt', 'roadmap', 'was als nächstes', 'weiterbauen'])) return 'project_next_step';
  return 'general';
}

function routeIntent(intent: AgentIntent): AgentRoute {
  if (intent === 'internal_data') return 'privacy_gate';
  if (intent === 'tool_required') return 'tool_required';
  if (intent === 'agent_builder') return 'agent_builder';
  if (intent === 'committee_decision' || intent === 'live_switch' || intent === 'project_next_step' || intent === 'improvement') return 'committee';
  return 'direct';
}

function decidePrivacy(input: string): PrivacyDecision {
  const value = input.toLowerCase();
  if (includesAny(value, ['geheim', 'passwort', 'api key', 'token', 'personenbezogen', 'iban', 'private adresse'])) return 'block_external';
  if (includesAny(value, ['kunde', 'kundendaten', 'angebot', 'kalkulation', 'mitarbeiter', 'intern', 'vertraulich', 'vertrag', 'rechnung'])) return 'require_anonymization';
  return 'allow_local_only';
}

function confidence(intent: AgentIntent): 'low' | 'medium' | 'high' {
  if (intent === 'general') return 'medium';
  if (intent === 'tool_required') return 'high';
  if (intent === 'internal_data') return 'high';
  return 'high';
}

function priority(intent: AgentIntent, route: AgentRoute, privacy: PrivacyDecision): 'low' | 'medium' | 'high' | 'critical' {
  if (privacy === 'block_external') return 'critical';
  if (route === 'privacy_gate') return 'high';
  if (intent === 'live_switch') return 'high';
  if (route === 'agent_builder') return 'medium';
  if (route === 'tool_required') return 'medium';
  return 'medium';
}

function liveReadiness(route: AgentRoute, privacy: PrivacyDecision): 'not_ready' | 'prepare_gate' | 'blocked_by_privacy' | 'tool_required_first' {
  if (privacy === 'block_external' || route === 'privacy_gate') return 'blocked_by_privacy';
  if (route === 'tool_required') return 'tool_required_first';
  return 'prepare_gate';
}

function label(route: AgentRoute) {
  if (route === 'direct') return 'Direkte lokale Antwort';
  if (route === 'committee') return 'Gremium empfohlen';
  if (route === 'privacy_gate') return 'Datenschutz-Gate aktiv';
  if (route === 'tool_required') return 'Tool/Internet nötig';
  return 'Spezialagenten-Entwurf';
}

function buildCommittee(route: AgentRoute) {
  if (!['committee', 'agent_builder', 'privacy_gate'].includes(route)) return [];
  return [
    { role: 'Visionär', focus: 'Chance und Zielbild', opinion: 'Der Master-Agent sollte jetzt als zentrale Arbeitsfläche genutzt werden. Zusätzliche Module nur noch bauen, wenn sie direkt den Arbeitsfluss verbessern.' },
    { role: 'Skeptiker', focus: 'Risiken und blinde Flecken', opinion: 'Vor Live-KI müssen Build, Datenschutz-Gate, Logging und Freigabeprozess stabil sein. Keine externen Daten senden, solange kein Gate aktiv ist.' },
    { role: 'Umsetzer', focus: 'Nächster Schritt', opinion: 'Erst lokale Fragen testen, Fehler sammeln, Verlauf prüfen und genau danach die Antwortqualität verbessern.' },
    { role: 'Datenschutz & Risiko', focus: 'Interne Daten', opinion: 'Bei internen oder personenbezogenen Daten lokal bleiben, anonymisieren oder später vor externer Nutzung eine explizite Freigabe verlangen.' },
    { role: 'Wirtschaftlichkeit & Praxisnutzen', focus: 'Alltagstauglichkeit', opinion: 'Der Agent ist wertvoll, wenn eine echte Frage schnell zu einer Entscheidung, einem Risiko-Hinweis und einem nächsten Schritt führt.' },
  ];
}

function buildAnswer(intent: AgentIntent, route: AgentRoute, privacy: PrivacyDecision) {
  if (route === 'tool_required') return 'Diese Frage braucht wahrscheinlich aktuelle Daten, Internet oder ein angebundenes Tool. Aktuell arbeitet der Master-Agent bewusst lokal. Ich kann die Frage strukturieren, aber keine Live-Daten abrufen.';
  if (route === 'privacy_gate') return privacy === 'block_external' ? 'Ich erkenne sensible Inhalte. Externe Weitergabe ist blockiert. Diese Eingabe darf aktuell nur lokal bewertet werden.' : 'Ich erkenne interne oder geschäftliche Daten. Der sichere Weg ist: lokal bearbeiten, sensible Teile markieren und vor späterer externer Nutzung anonymisieren oder Freigabe einholen.';
  if (route === 'agent_builder') return 'Das ist ein Kandidat für einen Spezialagenten. Ich würde zuerst Ziel, Eingaben, Ausgaben, Datenquellen, Grenzen, Freigaben und Testfragen definieren. Automatisch gebaut wird noch nichts.';
  if (intent === 'live_switch') return 'Noch nicht live schalten. Der richtige nächste Schritt ist: Build stabilisieren, lokale Testfragen prüfen, Datenschutz-Gate bestätigen und erst danach Provider-Gate vorbereiten.';
  if (intent === 'improvement') return 'Verbesserung ist jetzt sinnvoll. Priorität: bessere lokale Antworten, weniger alte Seiten, klarer Hauptworkflow, danach Provider-Freigabe. Nicht weiter Statusseiten stapeln.';
  if (route === 'committee') return 'Diese Frage eignet sich für das 5er-Gremium. Ich empfehle, Chance, Risiko, Umsetzung, Datenschutz und wirtschaftlichen Nutzen gemeinsam zu prüfen und daraus einen nächsten Schritt abzuleiten.';
  return 'Ich kann diese Frage lokal einordnen. Aktuell wird nichts extern gesendet. Wenn die Frage unsicher, strategisch oder risikobehaftet ist, sollte das Gremium einbezogen werden.';
}

function reason(intent: AgentIntent, route: AgentRoute, privacy: PrivacyDecision) {
  return 'Erkannt: Intent=' + intent + ', Route=' + route + ', Privacy=' + privacy + '. Entscheidung erfolgt lokal ohne Provider und ohne Internet. Live-Readiness wird nur vorbereitet, nicht aktiviert.';
}

function steps(intent: AgentIntent, route: AgentRoute) {
  if (route === 'tool_required') return ['Toolbedarf markieren', 'fehlende Datenquelle benennen', 'später Web/Provider nur per Freigabe aktivieren'];
  if (route === 'privacy_gate') return ['lokal bleiben', 'sensible Bestandteile markieren', 'Anonymisierung vorbereiten', 'Freigabe vor externer Nutzung verlangen'];
  if (route === 'agent_builder') return ['Agentenziel definieren', 'Eingaben und Ausgaben festlegen', 'Datenschutzgrenzen setzen', 'Testfragen sammeln'];
  if (intent === 'live_switch') return ['Build grün bekommen', 'lokale Testfragen prüfen', 'Provider-Gate planen', 'Live-Schalter erst danach aktivieren'];
  if (intent === 'improvement') return ['Antwortqualität verbessern', 'UI weiter glätten', 'alte kaputte Imports stabilisieren', 'erst danach Live-KI vorbereiten'];
  if (route === 'committee') return ['Gremium prüfen lassen', 'Risiken notieren', 'Entscheidungsvorschlag ableiten'];
  return ['lokal beantworten', 'bei Unsicherheit Gremium einschalten', 'Antwort im Browser-Log speichern'];
}

export function runSecureMasterLocalAgent(input: string): AgentLog {
  const intent = detectIntent(input);
  const route = routeIntent(intent);
  const privacyDecision = decidePrivacy(input);
  return {
    id: 'agent_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    input,
    inputPreview: input.trim().slice(0, 180),
    intent,
    route,
    privacyDecision,
    confidence: confidence(intent),
    priority: priority(intent, route, privacyDecision),
    liveReadiness: liveReadiness(route, privacyDecision),
    modeLabel: label(route),
    answer: buildAnswer(intent, route, privacyDecision),
    reason: reason(intent, route, privacyDecision),
    nextSteps: steps(intent, route),
    committee: buildCommittee(route),
  };
}
