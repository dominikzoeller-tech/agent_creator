/* Legacy CMT compatibility module: cmt-ask.ts. */
export function makeCompatStub(name: string): any {
  return new Proxy(function compatStub(..._args: any[]) {
    return { ok: true, stub: true, name, status: 'stubbed', items: [], logs: [], data: [], message: 'Legacy compatibility stub' };
  }, {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'toJSON') return () => ({ ok: true, stub: true, name });
      if (prop === Symbol.toPrimitive) return () => name;
      if (prop === 'length') return 0;
      return makeCompatStub(name + '.' + String(prop));
    },
    apply() {
      return { ok: true, stub: true, name, status: 'stubbed', items: [], logs: [], data: [], message: 'Legacy compatibility stub' };
    }
  });
}

export type CommitteeIntent =
  | 'weather'
  | 'live_switch'
  | 'internal_data'
  | 'agent_builder'
  | 'project_next_step'
  | 'business_decision'
  | 'general';

export type CommitteeRoleAnswer = {
  role: string;
  stance: 'support' | 'caution' | 'challenge' | 'execute' | 'protect';
  answer: string;
  risk: string;
  action: string;
};

export type CommitteeAskResult = {
  phase: '119.1';
  label: 'Gremium Ask MVP Plus';
  question: string;
  intent: CommitteeIntent;
  roles: CommitteeRoleAnswer[];
  finalAnswer: {
    headline: string;
    recommendation: string;
    directAnswer: string;
    reasoning: string[];
    risks: string[];
    nextActions: string[];
  };
  usableStatus: 'local-testable-plus';
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
  return trimmed || 'Welche Entscheidung soll das Gremium bewerten?';
}

function detectIntent(question: string): CommitteeIntent {
  const q = question.toLowerCase();
  if (q.includes('wetter') || q.includes('regen') || q.includes('sonne') || q.includes('temperatur')) return 'weather';
  if (q.includes('live') || q.includes('provider') || q.includes('ki-modell') || q.includes('modell') || q.includes('schalten')) return 'live_switch';
  if (q.includes('intern') || q.includes('vertraulich') || q.includes('kunde') || q.includes('kalkulation') || q.includes('betriebsintern')) return 'internal_data';
  if (q.includes('agent') && (q.includes('bauen') || q.includes('erstellen') || q.includes('spezial') || q.includes('trading') || q.includes('immobilien'))) return 'agent_builder';
  if (q.includes('nächste') || q.includes('naechste') || q.includes('weiter') || q.includes('phase') || q.includes('roadmap')) return 'project_next_step';
  if (q.includes('soll ich') || q.includes('entscheidung') || q.includes('priorität') || q.includes('prioritaet') || q.includes('lohnt')) return 'business_decision';
  return 'general';
}

const intentText: Record<CommitteeIntent, { direct: string; recommendation: string; headline: string }> = {
  weather: {
    headline: 'Wetterfrage erkannt.',
    recommendation: 'Nicht raten. Wetter braucht Web- oder Wetter-Tool-Freigabe.',
    direct: 'Ich kann das Wetter aktuell lokal nicht zuverlässig beantworten, weil Internetzugriff und Wetter-Tool in diesem Agenten noch deaktiviert sind. Der richtige nächste Schritt wäre: Wetter-Tool oder Webzugriff später über ein Freigabe-Gate anschließen.',
  },
  live_switch: {
    headline: 'Live-Schaltungsfrage erkannt.',
    recommendation: 'Noch nicht live schalten. Erst lokale Qualität verbessern und Provider-Gate vorbereiten.',
    direct: 'Der Agent ist jetzt lokal testbar, aber noch nicht live mit KI-Modell. Vor Live-Betrieb brauchen wir bessere frageabhängige Antworten, Datenschutzprüfung, Provider-Konfiguration, Kosten-/Timeout-Schutz und eine klare Freigabe.',
  },
  internal_data: {
    headline: 'Interne oder sensible Daten erkannt.',
    recommendation: 'Nicht ungeprüft an externe Provider senden.',
    direct: 'Bei internen Daten muss der Agent lokal arbeiten, anonymisieren oder zuerst deine Freigabe einholen. Noch ist kein echter Provider aktiv, deshalb bleiben Daten lokal im Testflow.',
  },
  agent_builder: {
    headline: 'Spezialagenten-Idee erkannt.',
    recommendation: 'Spezialagent als Entwurf planen, aber erst nach Freigabe bauen.',
    direct: 'Das ist ein sinnvoller Kandidat für einen Spezialagenten. Der Master-Agent sollte später Agentenprofile, Ziele, Datenquellen, Grenzen und Testfragen vorschlagen, bevor Code erzeugt wird.',
  },
  project_next_step: {
    headline: 'Projekt-/Roadmap-Frage erkannt.',
    recommendation: 'Nächster Schritt: Master-Agent-Router und Datenschutz-Gate vorbereiten.',
    direct: 'Für dieses Projekt ist der nächste sinnvolle Schritt, den Ask-Flow intelligenter zu machen und danach den Master-Agent-Router aufzubauen: direkte Antwort oder Gremium, plus Datenschutzentscheidung.',
  },
  business_decision: {
    headline: 'Entscheidungsfrage erkannt.',
    recommendation: 'Gremium nutzen und danach eine konkrete nächste Aktion wählen.',
    direct: 'Diese Frage passt gut zum Gremium. Der Agent sollte Chancen, Risiken, Umsetzbarkeit, Datenschutz und Wirtschaftlichkeit getrennt bewerten und daraus eine Empfehlung ableiten.',
  },
  general: {
    headline: 'Allgemeine Frage erkannt.',
    recommendation: 'Lokal beantworten, wenn möglich; bei Unsicherheit Gremium oder später Provider nutzen.',
    direct: 'Ich kann die Frage lokal grob einordnen. Für echte Wissensfragen oder aktuelle Daten braucht der Master-Agent später ein Modell, Webzugriff oder ein passendes Tool mit Freigabe.',
  },
};

function buildRoles(intent: CommitteeIntent, question: string): CommitteeRoleAnswer[] {
  const info = intentText[intent];
  return [
    {
      role: 'Visionär',
      stance: 'support',
      answer: intent === 'weather'
        ? 'Ein Wetter-Tool wäre ein guter erster externer Tool-Test, weil der Nutzen sofort sichtbar ist.'
        : 'Die Frage kann genutzt werden, um den Master-Agenten schrittweise nützlicher zu machen.',
      risk: 'Wenn der Agent zu früh zu viel verspricht, entsteht falsches Vertrauen.',
      action: 'Nutzen klar benennen und nur Funktionen anzeigen, die im aktuellen Modus wirklich aktiv sind.',
    },
    {
      role: 'Skeptiker',
      stance: 'challenge',
      answer: 'Die Antwort muss ehrlich markieren, was lokal möglich ist und was noch nicht aktiv ist.',
      risk: intent === 'weather'
        ? 'Ohne Live-Daten wäre jede konkrete Wetterantwort geraten.'
        : 'Ohne klare Grenzen kann der Nutzer lokale Demo-Antworten mit echten KI-Antworten verwechseln.',
      action: 'Antwortquelle, Modus und Grenzen direkt in der Antwort anzeigen.',
    },
    {
      role: 'Umsetzer',
      stance: 'execute',
      answer: 'Der Flow funktioniert technisch. Jetzt muss die Antwort stärker von der Frage abhängen.',
      risk: 'Wenn die Antworten generisch bleiben, bringt der lokale Test wenig Erkenntnis.',
      action: 'Fragetyp erkennen, passende Antwortbausteine wählen und nächste Testfragen sammeln.',
    },
    {
      role: 'Datenschutz & Risiko',
      stance: 'protect',
      answer: intent === 'internal_data'
        ? 'Diese Eingabe muss als sensibel behandelt werden. Externe Weitergabe nur anonymisiert oder nach Freigabe.'
        : 'Provider, Internet und externe Tools bleiben aktuell blockiert.',
      risk: 'Betriebsinterne Daten dürfen später nicht versehentlich an externe Dienste gehen.',
      action: 'Vor Provider-Aktivierung ein Datenklassifizierungs- und Freigabe-Gate bauen.',
    },
    {
      role: 'Wirtschaftlichkeit & Praxisnutzen',
      stance: 'support',
      answer: 'Der nächste Nutzen entsteht, wenn der Agent echte Alltagsfragen unterscheidbar beantwortet.',
      risk: 'Zu viele technische Seiten ohne Nutzwert verlangsamen den Fortschritt.',
      action: 'Mit 10 echten Fragen testen und daraus die wichtigsten Agentenfähigkeiten priorisieren.',
    },
  ];
}

export function askCommitteeLocal(question: string): CommitteeAskResult {
  const q = normalizeQuestion(question);
  const intent = detectIntent(q);
  const info = intentText[intent];
  const roles = buildRoles(intent, q);

  return {
    phase: '119.1',
    label: 'Gremium Ask MVP Plus',
    question: q,
    intent,
    roles,
    finalAnswer: {
      headline: info.headline,
      recommendation: info.recommendation,
      directAnswer: info.direct,
      reasoning: [
        'Die Frage wurde lokal klassifiziert als: ' + intent + '.',
        'Das 5er-Gremium wurde mit Visionär, Skeptiker, Umsetzer, Datenschutz & Risiko sowie Wirtschaftlichkeit & Praxisnutzen ausgeführt.',
        'Es wurden keine Provider-, Internet- oder Modellaufrufe ausgeführt.',
      ],
      risks: roles.map((role: any) => role.risk),
      nextActions: [
        'Teste mehrere echte Fragen auf /cmt/ask.',
        'Notiere Fragen, bei denen die lokale Antwort noch zu schwach ist.',
        'Danach Master-Agent-Router und Datenschutz-Gate vorbereiten.',
      ],
    },
    usableStatus: 'local-testable-plus',
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

export function getCommitteeAskDemo() {
  return askCommitteeLocal('Soll ich den Gremium-Agenten jetzt live schalten oder erst verbessern?');
}

export type SecureMasterCommitteeResult = any;
export type SecureMasterCommitteeDemo = any;
export type SecureMasterAppEntry = any;
export type SecureMasterNavStatus = any;
export type SecureMasterAnswerLogEntry = any;
export type SecureMasterAnswerLogStatus = any;
export type SecureMasterAnswerLogList = any;
export type SecureMasterAnswerLogBrowserStore = any;
export type SecureMasterAnswerLogListBrowserStore = any;
export type PrivacyDecisionOption = any;
export type CmtPrivacyDecision = any;
export type SecureMasterProviderAdapterContract = any;
export type SecureMasterProviderAuditEnvelope = any;
export type SecureMasterProviderAuditHistoryItem = any;
export const getSecureMasterAppEntry: any = makeCompatStub('getSecureMasterAppEntry');
export const getSecureMasterNavStatus: any = makeCompatStub('getSecureMasterNavStatus');
export const getSecureMasterCommittee: any = makeCompatStub('getSecureMasterCommittee');
export const getSecureMasterCommitteeDemo: any = makeCompatStub('getSecureMasterCommitteeDemo');
export const createSecureMasterCommittee: any = makeCompatStub('createSecureMasterCommittee');
export const getSecureMasterGuide: any = makeCompatStub('getSecureMasterGuide');
export const getSecureMasterStatus: any = makeCompatStub('getSecureMasterStatus');
export const getSecureMasterAnswerLogEntry: any = makeCompatStub('getSecureMasterAnswerLogEntry');
export const getSecureMasterAnswerLogStatus: any = makeCompatStub('getSecureMasterAnswerLogStatus');
export const getSecureMasterAnswerLogList: any = makeCompatStub('getSecureMasterAnswerLogList');
export const getSecureMasterAnswerLogBrowserStore: any = makeCompatStub('getSecureMasterAnswerLogBrowserStore');
export const getSecureMasterAnswerLogBrowserStoreEntry: any = makeCompatStub('getSecureMasterAnswerLogBrowserStoreEntry');
export const getSecureMasterAnswerLogListBrowserStore: any = makeCompatStub('getSecureMasterAnswerLogListBrowserStore');
export const getSecureMasterAnswerLogListBrowserStoreEntry: any = makeCompatStub('getSecureMasterAnswerLogListBrowserStoreEntry');
export const getPrivacyGateDemo: any = makeCompatStub('getPrivacyGateDemo');
export const evaluatePrivacyGate: any = makeCompatStub('evaluatePrivacyGate');
export const evaluateCmtPrivacyGate: any = makeCompatStub('evaluateCmtPrivacyGate');
export const sanitizeForLocalPreview: any = makeCompatStub('sanitizeForLocalPreview');
export const decidePrivacyAction: any = makeCompatStub('decidePrivacyAction');
export const getPrivacyDecisionDemo: any = makeCompatStub('getPrivacyDecisionDemo');
export const isPrivacyDecisionOption: any = makeCompatStub('isPrivacyDecisionOption');
export const getPrivacyDecisionLabel: any = makeCompatStub('getPrivacyDecisionLabel');
export const createSecureMasterProviderAdapterContract: any = makeCompatStub('createSecureMasterProviderAdapterContract');
export const createSecureMasterProviderAuditEnvelope: any = makeCompatStub('createSecureMasterProviderAuditEnvelope');
export const createProviderAuditEnvelope: any = makeCompatStub('createProviderAuditEnvelope');
export const createProviderAuditHistoryItem: any = makeCompatStub('createProviderAuditHistoryItem');
export default makeCompatStub('default:cmt-ask.ts');


// Legacy runtime compatibility export.
export function createCommitteeAskState(input: any = {}, options: any = {}): any {
  const prompt = typeof input === 'string' ? input : String(input?.prompt ?? input?.question ?? input?.input ?? '');
  return {
    ok: true,
    stub: true,
    phase: 'committee-ask-state-compat',
    prompt,
    input,
    options,
    status: 'ready',
    state: 'ready',
    localOnly: true,
    externalSharingAllowed: false,
    providerDispatchAllowed: false,
    networkCallAllowed: false,
    finalDispatchBlocked: true,
    selectedOption: 'local_only',
    committee: {
      enabled: true,
      roles: ['chair', 'privacy', 'tech', 'risk', 'quality'],
    },
    createdAt: new Date().toISOString(),
  };
}
