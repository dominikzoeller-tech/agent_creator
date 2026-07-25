/* Legacy CMT compatibility module: cmt-store.ts. */
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

export type CommitteeRoleId =
  | 'strategy'
  | 'legal'
  | 'technical'
  | 'finance'
  | 'risk'
  | 'execution';

export type CommitteeRole = {
  id: CommitteeRoleId;
  title: string;
  responsibility: string;
  defaultPerspective: string;
  enabled: true;
};

export type CommitteeCore = {
  phase: '110.0';
  label: 'Gremium Core';
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  finalDispatchBlocked: true;
  executionGateClosed: true;
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  roles: CommitteeRole[];
};

export const committeeRoles: CommitteeRole[] = [
  {
    id: 'strategy',
    title: 'Strategy',
    responsibility: 'Bewertet Zielbild, Nutzen, Prioritaet und strategische Passung.',
    defaultPerspective: 'Langfristiger Nutzen, Zielkonflikte, Positionierung und Entscheidungsklarheit.',
    enabled: true,
  },
  {
    id: 'legal',
    title: 'Legal',
    responsibility: 'Prueft rechtliche, regulatorische und vertragliche Risiken.',
    defaultPerspective: 'Compliance, Haftung, Datenschutz, Vertragslage und Freigabebedarf.',
    enabled: true,
  },
  {
    id: 'technical',
    title: 'Technical',
    responsibility: 'Bewertet Architektur, Machbarkeit, Abhaengigkeiten und technische Risiken.',
    defaultPerspective: 'Systemdesign, Umsetzbarkeit, Skalierung, Wartbarkeit und Integrationsrisiken.',
    enabled: true,
  },
  {
    id: 'finance',
    title: 'Finance',
    responsibility: 'Bewertet Kosten, Nutzen, Aufwand, Budget und wirtschaftliche Tragfaehigkeit.',
    defaultPerspective: 'ROI, Kostenrahmen, Opportunitaetskosten, Budgetwirkung und Zahlungsrisiken.',
    enabled: true,
  },
  {
    id: 'risk',
    title: 'Risk',
    responsibility: 'Identifiziert Risiken, Nebenwirkungen, Sicherheitsfragen und offene Annahmen.',
    defaultPerspective: 'Worst case, Eintrittswahrscheinlichkeit, Schadenshoehe und Gegenmassnahmen.',
    enabled: true,
  },
  {
    id: 'execution',
    title: 'Execution',
    responsibility: 'Bewertet Umsetzung, Reihenfolge, Abhaengigkeiten und konkrete naechste Schritte.',
    defaultPerspective: 'Operationalisierung, Meilensteine, Verantwortlichkeiten, Blocker und Lieferbarkeit.',
    enabled: true,
  },
];

export function getCommitteeCore(): CommitteeCore {
  return {
    phase: '110.0',
    label: 'Gremium Core',
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    finalDispatchBlocked: true,
    executionGateClosed: true,
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    roles: committeeRoles,
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
export default makeCompatStub('default:cmt-store.ts');
