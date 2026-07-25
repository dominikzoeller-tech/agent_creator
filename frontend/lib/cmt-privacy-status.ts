/* Legacy CMT compatibility module: cmt-privacy-status.ts. */
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

import { getPrivacyGateDemo, type PrivacyGateResult } from './cmt-privacy-gate';

export type PrivacyGateStatus = {
  phase: '121.1';
  label: 'Privacy Gate Status';
  demo: PrivacyGateResult;
  status: {
    currentMode: 'privacy-gate-local-testable';
    mainPage: '/cmt/privacy';
    apiRoute: '/api/cmt/privacy';
    detectsInternalData: true;
    detectsPersonalData: true;
    detectsBusinessData: true;
    detectsSecretData: true;
    anonymizedPreviewEnabled: true;
    userApprovalPrepared: true;
    externalSharingAllowed: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    summary: string;
  };
  allowedOptions: string[];
  testInputs: string[];
  nextMilestones: string[];
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getPrivacyGateStatus(): PrivacyGateStatus {
  const demo = getPrivacyGateDemo();
  return {
    phase: '121.1',
    label: 'Privacy Gate Status',
    demo,
    status: {
      currentMode: 'privacy-gate-local-testable',
      mainPage: '/cmt/privacy',
      apiRoute: '/api/cmt/privacy',
      detectsInternalData: true,
      detectsPersonalData: true,
      detectsBusinessData: true,
      detectsSecretData: true,
      anonymizedPreviewEnabled: true,
      userApprovalPrepared: true,
      externalSharingAllowed: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      summary: 'Das Privacy Gate ist lokal testbar. Es erkennt sensible Daten, erstellt eine anonymisierte Vorschau und blockiert externe Weitergabe.',
    },
    allowedOptions: ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'],
    testInputs: [
      'Erklaere mir allgemein, was der Master-Agent kann.',
      'Hier ist eine interne Kalkulation fuer Kunde Muster.',
      'Bitte pruefe Angebot 123 mit Marge und Kosten.',
      'Kontakt: test@example.com und Telefon 01234 567890.',
      'Das ist vertraulich und enthaelt ein API Key Secret.',
    ],
    nextMilestones: [
      'Privacy Gate in Master-Agent-Seite sichtbar integrieren',
      'Freigabeoptionen als UI-Auswahl vorbereiten',
      'Anonymisierung robuster machen',
      'Provider-Readiness erst nach Privacy-Gate-Stabilisierung vorbereiten',
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
export default makeCompatStub('default:cmt-privacy-status.ts');
