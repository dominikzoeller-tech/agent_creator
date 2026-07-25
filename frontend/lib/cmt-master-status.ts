/* Legacy CMT compatibility module: cmt-master-status.ts. */
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

import { getMasterAgentDemo, type MasterAgentResult } from './cmt-master';

export type MasterAgentStatus = {
  phase: '120.1';
  label: 'Master Agent Router Status';
  demo: MasterAgentResult;
  status: {
    currentMode: 'master-router-local-testable';
    mainPage: '/cmt/master';
    apiRoute: '/api/cmt/master';
    routesSupported: string[];
    canAnswerDirect: true;
    canAskCommittee: true;
    canDetectPrivacyGate: true;
    canDetectToolRequired: true;
    canDetectAgentBuilder: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    summary: string;
  };
  testQuestions: string[];
  nextMilestones: string[];
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getMasterAgentStatus(): MasterAgentStatus {
  const demo = getMasterAgentDemo();
  return {
    phase: '120.1',
    label: 'Master Agent Router Status',
    demo,
    status: {
      currentMode: 'master-router-local-testable',
      mainPage: '/cmt/master',
      apiRoute: '/api/cmt/master',
      routesSupported: ['direct', 'committee', 'privacy_gate', 'tool_required', 'agent_builder'],
      canAnswerDirect: true,
      canAskCommittee: true,
      canDetectPrivacyGate: true,
      canDetectToolRequired: true,
      canDetectAgentBuilder: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      summary: 'Der Master-Agent-Router ist lokal testbar. Er entscheidet zwischen Direktantwort, Gremium, Privacy-Gate, Toolbedarf und Spezialagenten-Idee.',
    },
    testQuestions: [
      'Erklaere mir kurz den aktuellen Stand des Projekts.',
      'Soll ich den Gremium-Agenten jetzt live schalten?',
      'Hier ist eine interne Kalkulation fuer Kunde Muster, darfst du das auswerten?',
      'Wie wird das Wetter morgen?',
      'Baue mir spaeter einen Trading-Agenten.',
      'Lohnt sich ein Immobilienbewertungs-Agent fuer uns?',
    ],
    nextMilestones: [
      'Master-Agent UI klarer mit Hauptchat verbinden',
      'Datenschutz-Gate mit Freigabe-/Anonymisierungsoption ausbauen',
      'Provider-Readiness fuer echten KI-Modell-Test vorbereiten',
      'Spezialagenten-Entwurf als eigenen Flow vorbereiten',
    ],
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
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
export default makeCompatStub('default:cmt-master-status.ts');
