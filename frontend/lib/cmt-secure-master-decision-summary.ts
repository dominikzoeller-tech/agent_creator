/* Legacy CMT compatibility module: cmt-secure-master-decision-summary.ts. */
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
export default makeCompatStub('default:cmt-secure-master-decision-summary.ts');
