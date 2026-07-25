/* Legacy CMT compatibility module: cmt-secure-master-action-plan.ts. */
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
export default makeCompatStub('default:cmt-secure-master-action-plan.ts');
