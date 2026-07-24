import { askSecureMasterAgent, type SecureMasterAgentResult } from './cmt-master-secure';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterQualityResult = SecureMasterAgentResult & {
  phaseQuality: '124.0';
  qualityLabel: 'Secure Master Local Answer Quality';
  detectedIntent: 'general' | 'live_switch' | 'internal_data' | 'committee_decision' | 'tool_required' | 'agent_builder' | 'project_next_step';
  improvedAnswer: string;
  committeeRolesVisible: boolean;
  localNextSteps: string[];
  missingCapability: string | null;
};

function lower(input: string) {
  return input.toLowerCase();
}

function detectIntent(input: string): SecureMasterQualityResult['detectedIntent'] {
  const q = lower(input);
  if (q.includes('live') || q.includes('freischalten') || q.includes('schalten')) return 'live_switch';
  if (q.includes('intern') || q.includes('kunde') || q.includes('kalkulation') || q.includes('vertraulich')) return 'internal_data';
  if (q.includes('gremium') || q.includes('entscheidung') || q.includes('soll ich') || q.includes('risiko')) return 'committee_decision';
  if (q.includes('wetter') || q.includes('aktuell') || q.includes('online') || q.includes('internet')) return 'tool_required';
  if (q.includes('agent') && (q.includes('bau') || q.includes('erstell') || q.includes('trading') || q.includes('immobilien'))) return 'agent_builder';
  if (q.includes('nächster') || q.includes('naechster') || q.includes('weiter') || q.includes('roadmap')) return 'project_next_step';
  return 'general';
}

function answerForIntent(intent: SecureMasterQualityResult['detectedIntent'], base: SecureMasterAgentResult) {
  if (intent === 'live_switch') {
    return 'Noch nicht live schalten. Der sichere Master-Agent ist lokal testbar, aber Provider, Internetzugriff und Live-Modell sind weiterhin deaktiviert. Erst lokale Antwortqualität, Gremium-Ausgabe und Datenschutzfluss stabilisieren.';
  }
  if (intent === 'internal_data') {
    return 'Interne oder vertrauliche Daten werden lokal durch das Privacy Gate geprüft. Der Agent darf solche Daten aktuell nicht extern weitergeben. Sichere Optionen sind local_only oder anonymize_then_send als Vorschau; approve_external_send bleibt blockiert.';
  }
  if (intent === 'committee_decision') {
    return 'Das ist eine typische Gremiumsfrage. Der Master-Agent sollte lokal das 5er-Gremium sichtbar machen: Visionär, Skeptiker, Umsetzer, Datenschutz & Risiko sowie Wirtschaftlichkeit & Praxisnutzen. Danach folgt eine klare Empfehlung.';
  }
  if (intent === 'tool_required') {
    return 'Für diese Frage fehlt aktuell ein freigegebenes Tool. Wetter, aktuelle Preise, News oder Live-Webdaten können im lokalen Modus nicht sicher beantwortet werden. Der Agent soll das sauber melden und später nach Freigabe ein Tool nutzen.';
  }
  if (intent === 'agent_builder') {
    return 'Das ist ein Kandidat für einen Spezialagenten. Der Master-Agent sollte lokal einen Entwurf vorbereiten: Zweck, Eingaben, Grenzen, Datenschutzregeln, Tools, Testfragen und Freigabepunkte. Noch wird kein Agent produktiv erzeugt.';
  }
  if (intent === 'project_next_step') {
    return 'Der nächste sinnvolle Projektschritt ist lokal: Antwortqualität verbessern, Gremiumsrollen direkt anzeigen und danach Provider-Readiness vorbereiten. Noch kein Live-Modell aktivieren.';
  }
  return 'Der Master-Agent kann diese Frage lokal direkt bearbeiten. Wenn Unsicherheit, Risiko oder Strategie erkennbar wird, routet der Agent zum Gremium. Wenn sensible Daten erkannt werden, greift zuerst das Privacy Gate.';
}

function nextStepsForIntent(intent: SecureMasterQualityResult['detectedIntent']) {
  if (intent === 'live_switch') return ['Nicht live schalten', 'lokal weiter testen', 'Provider weiterhin deaktiviert lassen'];
  if (intent === 'internal_data') return ['Privacy Gate Ergebnis prüfen', 'local_only nutzen', 'Anonymisierungsvorschau prüfen'];
  if (intent === 'committee_decision') return ['5 Rollen anzeigen', 'Risiken sammeln', 'finale Empfehlung ausgeben'];
  if (intent === 'tool_required') return ['Toolbedarf benennen', 'keine Live-Daten erfinden', 'später Tool-Freigabe vorbereiten'];
  if (intent === 'agent_builder') return ['Agentenprofil entwerfen', 'Datenschutzgrenzen definieren', 'Testfragen erstellen'];
  if (intent === 'project_next_step') return ['Antwortqualität verbessern', 'Gremium integrieren', 'Provider-Readiness später vorbereiten'];
  return ['lokal beantworten', 'bei Unsicherheit Gremium nutzen', 'bei sensiblen Daten Privacy Gate nutzen'];
}

function missingCapability(intent: SecureMasterQualityResult['detectedIntent']) {
  if (intent === 'tool_required') return 'Freigegebenes Tool fuer Live-Daten, Web, Wetter oder aktuelle Informationen';
  if (intent === 'live_switch') return 'Live-Modell-Freigabe und Provider-Konfiguration';
  if (intent === 'agent_builder') return 'Produktiver Spezialagenten-Generator';
  return null;
}

export function askSecureMasterQuality(input: string, option: PrivacyDecisionOption = 'local_only'): SecureMasterQualityResult {
  const base = askSecureMasterAgent(input, option);
  const intent = detectIntent(input);
  return {
    ...base,
    phaseQuality: '124.0',
    qualityLabel: 'Secure Master Local Answer Quality',
    detectedIntent: intent,
    improvedAnswer: answerForIntent(intent, base),
    committeeRolesVisible: intent === 'committee_decision',
    localNextSteps: nextStepsForIntent(intent),
    missingCapability: missingCapability(intent),
  };
}

export function getSecureMasterQualityDemo() {
  return askSecureMasterQuality('Soll ich fuer diese interne Entscheidung das Gremium fragen?', 'local_only');
}
