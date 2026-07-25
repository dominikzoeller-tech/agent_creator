export type AgentRoute = 'direct' | 'committee' | 'privacy_gate' | 'tool_required' | 'agent_builder';
export type AgentIntent = 'general' | 'live_switch' | 'internal_data' | 'committee_decision' | 'tool_required' | 'agent_builder' | 'project_next_step';
export type PrivacyDecision = 'allow_local_only' | 'require_anonymization' | 'block_external';

export type AgentLog = {
  id: string;
  createdAt: string;
  input: string;
  inputPreview: string;
  intent: AgentIntent;
  route: AgentRoute;
  privacyDecision: PrivacyDecision;
  answer: string;
  nextSteps: string[];
  committee: { role: string; focus: string; opinion: string }[];
};

export const SECURE_MASTER_AGENT_LOG_KEY = 'cmt.secureMaster.agent.mvp.logs.v1';

const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

function detectIntent(input: string): AgentIntent {
  const value = input.toLowerCase();
  if (includesAny(value, ['wetter', 'news', 'aktuell', 'kurs', 'internet', 'recherchier', 'suche im web'])) return 'tool_required';
  if (includesAny(value, ['kunde', 'kundendaten', 'intern', 'vertraulich', 'geheim', 'angebot', 'kalkulation', 'mitarbeiter', 'personenbezogen'])) return 'internal_data';
  if (includesAny(value, ['agent bauen', 'agenten bauen', 'spezialagent', 'trading agent', 'immobilien agent', 'bauleiter entlasten'])) return 'agent_builder';
  if (includesAny(value, ['live schalten', 'aktivieren', 'provider', 'ki-modell', 'modell anschließen', 'modell anschliessen'])) return 'live_switch';
  if (includesAny(value, ['soll ich', 'sollen wir', 'entscheidung', 'priorisieren', 'strategie', 'risiko', 'gremium'])) return 'committee_decision';
  if (includesAny(value, ['nächster schritt', 'naechster schritt', 'roadmap', 'was als nächstes', 'weiterbauen', 'verbessern'])) return 'project_next_step';
  return 'general';
}

function routeIntent(intent: AgentIntent): AgentRoute {
  if (intent === 'internal_data') return 'privacy_gate';
  if (intent === 'tool_required') return 'tool_required';
  if (intent === 'agent_builder') return 'agent_builder';
  if (intent === 'committee_decision' || intent === 'live_switch' || intent === 'project_next_step') return 'committee';
  return 'direct';
}

function decidePrivacy(input: string): PrivacyDecision {
  const value = input.toLowerCase();
  if (includesAny(value, ['geheim', 'passwort', 'api key', 'token', 'personenbezogen'])) return 'block_external';
  if (includesAny(value, ['kunde', 'kundendaten', 'angebot', 'kalkulation', 'mitarbeiter', 'intern', 'vertraulich'])) return 'require_anonymization';
  return 'allow_local_only';
}

function buildCommittee(route: AgentRoute) {
  if (!['committee', 'agent_builder', 'privacy_gate'].includes(route)) return [];
  return [
    { role: 'Visionär', focus: 'Chance und Zielbild', opinion: 'Fokus auf eine zentrale Arbeitsseite statt weiterer Statusseiten.' },
    { role: 'Skeptiker', focus: 'Risiken und blinde Flecken', opinion: 'Erst Eingabe, Antwort, Datenschutzprüfung, Log und Verlauf stabil machen.' },
    { role: 'Umsetzer', focus: 'Nächster Schritt', opinion: 'Frage eingeben, lokal prüfen, Antwort anzeigen, Browser-Log speichern.' },
    { role: 'Datenschutz & Risiko', focus: 'Interne Daten', opinion: 'Kein Provider, kein Internet, keine externe Weitergabe ohne spätere Freigabe.' },
    { role: 'Wirtschaftlichkeit & Praxisnutzen', focus: 'Alltagstauglichkeit', opinion: 'Der Agent wird wertvoll, wenn er echte Fragen schnell sortiert und nachvollziehbar protokolliert.' },
  ];
}

function buildAnswer(intent: AgentIntent, route: AgentRoute, privacy: PrivacyDecision) {
  if (route === 'tool_required') return 'Diese Frage braucht wahrscheinlich Internet, aktuelle Daten oder ein externes Tool. Aktuell bleibt der Secure Master lokal: kein Internet, kein Provider, kein Live-Modell.';
  if (route === 'privacy_gate') return privacy === 'block_external' ? 'Ich erkenne sensible oder geheime Inhalte. Externe Weitergabe ist blockiert. Nur lokal bewerten.' : 'Ich erkenne interne oder geschäftliche Daten. Lokal bearbeiten oder später anonymisieren und Freigabe einholen.';
  if (route === 'agent_builder') return 'Das klingt nach einem Spezialagenten. Nächster Schritt: Agentenprofil mit Ziel, Eingaben, Datenquellen, Grenzen, Datenschutzregeln und Testfragen erstellen.';
  if (intent === 'live_switch') return 'Noch nicht live schalten. Erst lokalen Master-Agent-Flow stabilisieren, danach Provider-Gate und Live-Schalter kontrolliert aktivieren.';
  if (route === 'committee') return 'Diese Frage eignet sich für das 5er-Gremium. Empfehlung: Chance, Risiko, Umsetzung, Datenschutz und wirtschaftlichen Nutzen gemeinsam prüfen.';
  return 'Lokale Antwort: Ich ordne diese Frage im sicheren Trockenlauf ein. Es wird nichts extern gesendet.';
}

function buildSteps(route: AgentRoute) {
  if (route === 'tool_required') return ['Toolbedarf markieren', 'Datenquelle definieren', 'später Web/Provider nur per Freigabe aktivieren'];
  if (route === 'privacy_gate') return ['nur lokal verarbeiten', 'interne Begriffe prüfen', 'Anonymisierung vorbereiten'];
  if (route === 'agent_builder') return ['Spezialagenten-Ziel definieren', 'Eingaben und Ausgaben festlegen', 'Datenschutzgrenzen setzen'];
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
    inputPreview: input.trim().slice(0, 160),
    intent,
    route,
    privacyDecision,
    answer: buildAnswer(intent, route, privacyDecision),
    nextSteps: buildSteps(route),
    committee: buildCommittee(route),
  };
}
