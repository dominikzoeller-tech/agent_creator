import { getSecureMasterCommitteeDemo } from './cmt-master-committee';
import type { SecureMasterCommitteeResult } from './cmt-master-committee';

export type SecureMasterCommitteeStatus = {
  phase: '125.1';
  ok: true;
  label: string;
  committeeAvailable: boolean;
  roles: string[];
  testPrompts: string[];
  nextMilestones: string[];
  committeeState: {
    summary: string;
    ready: boolean;
    roles: number;
    integratedInSecureMaster: boolean;
    fiveRolesVisible: boolean;
    localOnly: boolean;
    decisionQuestionsDetected: boolean;
    finalRecommendationVisible: boolean;
    liveModelEnabled: boolean;
    providerEnabled: boolean;
    internetEnabled: boolean;
    externalSharingAllowed: boolean;
    privacyGateActive: boolean;
    externalCallsBlocked: boolean;
    browserCompatible: boolean;
    buildCompatibilityMode: boolean;
  };
  mainCommitteePage: string;
  mainQualityPage: string;
  demo: SecureMasterCommitteeResult;
  checkedAt: string;
  message: string;
};

const defaultRoles = [
  'Vorsitz / Synthese',
  'Datenschutz / Privacy',
  'Technik / Architektur',
  'Risiko / Sicherheit',
  'Qualitaet / Entscheidung',
];

const defaultTestPrompts = [
  'Soll diese Antwort lokal bleiben?',
  'Welche Risiken sieht das Gremium?',
  'Welche Empfehlung ergibt sich aus Datenschutz, Technik und Qualitaet?',
  'Welche Informationen muessen anonymisiert werden?',
  'Was ist der naechste sichere Schritt?',
];

const defaultNextMilestones = [
  'Build gruen bekommen',
  'Worker-Ergebnis laden',
  'Legacy-CMT-Routen konsolidieren',
  'Echte Implementierungen nach und nach aus Stubs herausloesen',
  'Provider-/Live-Funktionen nur nach expliziter Freigabe aktivieren',
];

export function getSecureMasterCommitteeStatus(): SecureMasterCommitteeStatus {
  const demo = getSecureMasterCommitteeDemo();
  return {
    phase: '125.1',
    ok: true,
    label: 'Secure Master Committee Status',
    committeeAvailable: true,
    roles: defaultRoles,
    testPrompts: defaultTestPrompts,
    nextMilestones: defaultNextMilestones,
    committeeState: {
      summary: 'Committee compatibility status is available. Legacy committee routes are stabilized for build validation.',
      ready: true,
      roles: defaultRoles.length,
      integratedInSecureMaster: true,
      fiveRolesVisible: true,
      localOnly: true,
      decisionQuestionsDetected: true,
      finalRecommendationVisible: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      privacyGateActive: true,
      externalCallsBlocked: true,
      browserCompatible: true,
      buildCompatibilityMode: true,
    },
    mainCommitteePage: '/cmt/master/secure/committee',
    mainQualityPage: '/cmt/master/secure/committee/quality',
    demo,
    checkedAt: new Date().toISOString(),
    message: 'Secure Master Committee legacy status compatibility is available.',
  };
}

export const createSecureMasterCommitteeStatus = getSecureMasterCommitteeStatus;
export default getSecureMasterCommitteeStatus;
