/* Legacy CMT compatibility module: cmt-delib.ts. */
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

import { committeeRoles, type CommitteeRoleId } from './cmt-store';
import { createCommitteeQuestion, type CommitteeQuestion } from './cmt-intake';

export type CommitteeOpinion = {
  roleId: CommitteeRoleId;
  title: string;
  stance: 'support' | 'caution' | 'block' | 'needs-info';
  summary: string;
  concerns: string[];
  nextStep: string;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
};

export type CommitteeDeliberation = {
  phase: '110.2';
  label: 'Gremium Deliberation';
  question: CommitteeQuestion;
  opinions: CommitteeOpinion[];
  aggregate: {
    recommendation: 'proceed-dry-run' | 'revise-before-proceeding' | 'blocked';
    summary: string;
    mainRisks: string[];
    nextSteps: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

function opinionFor(roleId: CommitteeRoleId, question: CommitteeQuestion): CommitteeOpinion {
  const role = committeeRoles.find((item: any) => item.id === roleId);
  const title = role?.title ?? roleId;
  const highRisk = question.riskLevel === 'high';
  const mediumRisk = question.riskLevel === 'medium';

  const stance: CommitteeOpinion['stance'] = highRisk && (roleId === 'legal' || roleId === 'risk')
    ? 'caution'
    : mediumRisk && roleId === 'risk'
      ? 'caution'
      : 'support';

  const concernByRole: Record<CommitteeRoleId, string[]> = {
    strategy: ['Zielbild und Prioritaet muessen klar bleiben.'],
    legal: ['Rechtliche und regulatorische Freigaben pruefen.'],
    technical: ['Technische Abhaengigkeiten und Schnittstellen validieren.'],
    finance: ['Budget, Aufwand und Nutzen transparent bewerten.'],
    risk: ['Risiken, Annahmen und Gegenmassnahmen dokumentieren.'],
    execution: ['Konkrete naechste Schritte und Verantwortlichkeiten festlegen.'],
  };

  const nextStepByRole: Record<CommitteeRoleId, string> = {
    strategy: 'Entscheidungsziel und Erfolgskriterien schriftlich festlegen.',
    legal: 'Compliance-/Datenschutz-Check vor echter Ausfuehrung vorbereiten.',
    technical: 'Technische Machbarkeit und Integrationspunkte pruefen.',
    finance: 'Aufwandsschaetzung und Nutzenhypothese ergaenzen.',
    risk: 'Risikoliste mit Gegenmassnahmen erstellen.',
    execution: 'Umsetzungsplan mit kleinem naechsten Schritt definieren.',
  };

  return {
    roleId,
    title,
    stance,
    summary: title + ' bewertet die Frage im Dry-run und liefert eine interne Einschaetzung ohne Provider-Call.',
    concerns: concernByRole[roleId],
    nextStep: nextStepByRole[roleId],
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
  };
}

export function createCommitteeDeliberation(text: string): CommitteeDeliberation {
  const question = createCommitteeQuestion(text);
  const opinions = question.selectedRoleIds.map((roleId) => opinionFor(roleId, question));
  const cautionCount = opinions.filter((opinion) => opinion.stance === 'caution').length;
  const recommendation: CommitteeDeliberation['aggregate']['recommendation'] =
    question.riskLevel === 'high' || cautionCount > 1
      ? 'revise-before-proceeding'
      : 'proceed-dry-run';

  return {
    phase: '110.2',
    label: 'Gremium Deliberation',
    question,
    opinions,
    aggregate: {
      recommendation,
      summary: 'Das simulierte Gremium hat die Frage rollenbasiert bewertet. Ergebnis bleibt dry-run-only.',
      mainRisks: Array.from(new Set(opinions.flatMap((opinion) => opinion.concerns))),
      nextSteps: opinions.map((opinion) => opinion.nextStep),
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeDeliberationDemo() {
  return createCommitteeDeliberation('Soll unser Agent eine Nutzerfrage an ein internes Gremium routen und eine Empfehlung erstellen?');
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
export default makeCompatStub('default:cmt-delib.ts');
