import { askCommitteeLocal, type CommitteeAskResult } from './cmt-ask';

export type MasterRouteDecision = {
  route: 'direct' | 'committee' | 'privacy_gate' | 'tool_required' | 'agent_builder';
  reason: string;
  confidence: 'low' | 'medium' | 'high';
};

export type MasterAgentResult = {
  phase: '120.0';
  label: 'Master Agent Router MVP';
  question: string;
  decision: MasterRouteDecision;
  directAnswer: string | null;
  committee: CommitteeAskResult | null;
  privacy: {
    sensitivity: 'public' | 'internal' | 'confidential';
    externalSharingAllowed: false;
    anonymizationRequired: boolean;
    userApprovalRequired: boolean;
  };
  nextActions: string[];
  usableStatus: 'master-router-local-testable';
  liveModelEnabled: false;
  localReasoningOnly: true;
  internetAccessEnabled: false;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

function normalizeQuestion(question: string) {
  const trimmed = question.trim();
  return trimmed || 'Was soll der Master-Agent beantworten?';
}

function classifySensitivity(question: string): MasterAgentResult['privacy']['sensitivity'] {
  const q = question.toLowerCase();
  if (q.includes('vertraulich') || q.includes('geheim') || q.includes('angebot') || q.includes('kalkulation')) return 'confidential';
  if (q.includes('intern') || q.includes('kunde') || q.includes('projekt') || q.includes('firma') || q.includes('betriebsintern')) return 'internal';
  return 'public';
}

function decideRoute(question: string, sensitivity: MasterAgentResult['privacy']['sensitivity']): MasterRouteDecision {
  const q = question.toLowerCase();
  if (sensitivity !== 'public') return { route: 'privacy_gate', reason: 'Interne oder vertrauliche Daten erkannt.', confidence: 'high' };
  if (q.includes('wetter') || q.includes('preis aktuell') || q.includes('news') || q.includes('heute') || q.includes('morgen')) return { route: 'tool_required', reason: 'Aktuelle externe Daten waeren noetig, Internet/Tool ist aber deaktiviert.', confidence: 'high' };
  if (q.includes('agent') && (q.includes('bauen') || q.includes('erstellen') || q.includes('spezial') || q.includes('trading') || q.includes('immobilien'))) return { route: 'agent_builder', reason: 'Spezialagenten-Idee erkannt.', confidence: 'high' };
  if (q.includes('soll ich') || q.includes('entscheidung') || q.includes('lohnt') || q.includes('risiko') || q.includes('strategie') || q.includes('priorit')) return { route: 'committee', reason: 'Entscheidungs- oder Risiko-Frage erkannt.', confidence: 'high' };
  return { route: 'direct', reason: 'Keine Gremiumspflicht erkannt; lokale Direktantwort reicht im Testmodus.', confidence: 'medium' };
}

function directLocalAnswer(question: string, decision: MasterRouteDecision) {
  if (decision.route === 'privacy_gate') return 'Ich erkenne interne oder vertrauliche Inhalte. Im aktuellen lokalen Modus sende ich nichts extern. Vor spaeterem Provider-Einsatz brauche ich Anonymisierung oder deine explizite Freigabe.';
  if (decision.route === 'tool_required') return 'Dafuer brauche ich spaeter ein freigegebenes Tool oder Webzugriff. Aktuell sind Internet und Provider deaktiviert, deshalb rate ich nicht.';
  if (decision.route === 'agent_builder') return 'Dafuer kann der Master-Agent spaeter einen Spezialagenten-Entwurf erstellen. Der naechste sichere Schritt ist ein Agentenprofil mit Ziel, Grenzen, Datenquellen und Testfragen.';
  return 'Lokale Direktantwort: Ich kann diese Frage im Testmodus grob beantworten. Fuer echte Wissens- oder Live-Antworten braucht der Master-Agent spaeter Provider, Toolzugriff oder Gremium je nach Risiko.';
}

export function askMasterAgentLocal(question: string): MasterAgentResult {
  const q = normalizeQuestion(question);
  const sensitivity = classifySensitivity(q);
  const decision = decideRoute(q, sensitivity);
  const useCommittee = decision.route === 'committee' || decision.route === 'agent_builder' || decision.route === 'tool_required';
  const committee = useCommittee ? askCommitteeLocal(q) : null;
  const anonymizationRequired = sensitivity !== 'public';
  const userApprovalRequired = sensitivity !== 'public' || decision.route === 'tool_required' || decision.route === 'agent_builder';

  return {
    phase: '120.0',
    label: 'Master Agent Router MVP',
    question: q,
    decision,
    directAnswer: useCommittee ? null : directLocalAnswer(q, decision),
    committee,
    privacy: {
      sensitivity,
      externalSharingAllowed: false,
      anonymizationRequired,
      userApprovalRequired,
    },
    nextActions: [
      'Teste /cmt/master mit direkten Fragen, Entscheidungsfragen und internen Daten.',
      'Pruefe, ob route direct, committee, privacy_gate, tool_required oder agent_builder sinnvoll gesetzt wird.',
      'Danach Master-Agent UI und Haupt-Chat-Integration verbessern.',
    ],
    usableStatus: 'master-router-local-testable',
    liveModelEnabled: false,
    localReasoningOnly: true,
    internetAccessEnabled: false,
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getMasterAgentDemo() {
  return askMasterAgentLocal('Soll ich den Gremium-Agenten jetzt live schalten oder erst verbessern?');
}
