export type SecureMasterStatusPrivacyDecision = {
  decision: 'allow_local_only' | 'block_external';
  hasSensitiveData: boolean;
  matches: string[];
  sanitizedText: string;
  reason: string;
};

export type SecureMasterStatusPrivacy = {
  decision: SecureMasterStatusPrivacyDecision;
  localOnly: true;
  externalSharingAllowed: false;
  providerEnabled: false;
  internetEnabled: false;
  liveModelEnabled: false;
};

export type SecureMasterStatusDemo = {
  ok: true;
  finalRoute: string;
  privacy: SecureMasterStatusPrivacy;
  requiresUserApproval: boolean;
  externalSharingAllowed: false;
  providerEnabled: false;
  internetEnabled: false;
  liveModelEnabled: false;
  summary: string;
};

export type SecureMasterCapabilities = Record<string, boolean | string | number>;

export type SecureMasterStatus = {
  phase: 'secure-master-status-compat';
  ok: true;
  label: string;
  currentMode: string;
  mainPage: string;
  capabilities: SecureMasterCapabilities;
  testInputs: string[];
  nextMilestones: string[];
  demo: SecureMasterStatusDemo;
  safety: {
    localOnly: true;
    externalSharingAllowed: false;
    providerEnabled: false;
    internetEnabled: false;
    liveModelEnabled: false;
    privacyGateActive: true;
    requiresUserApproval: boolean;
  };
  createdAt: string;
};

const defaultTestInputs = [
  'Bitte beantworte diese Frage lokal.',
  'Pruefe eine Antwort mit moeglichen Kundendaten.',
  'Soll diese Information anonymisiert werden?',
  'Welche Route ist fuer sichere Verarbeitung passend?',
];

const defaultNextMilestones = [
  'Build gruen bekommen',
  'Worker-Ergebnis laden',
  'Secure-Master-Statusseiten konsolidieren',
  'Legacy-Kompatibilitaets-Stubs spaeter durch echte Implementierungen ersetzen',
  'Live-/Provider-Funktionen nur nach expliziter Freigabe aktivieren',
];

export function getSecureMasterStatus(): SecureMasterStatus {
  return {
    phase: 'secure-master-status-compat',
    ok: true,
    label: 'Secure Master Status',
    currentMode: 'local_only_compatibility_mode',
    mainPage: '/cmt/master/secure',
    capabilities: {
      localOnly: true,
      privacyGateActive: true,
      browserCompatible: true,
      committeeCompatible: true,
      answerLogCompatible: true,
      externalSharingAllowed: false,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      buildCompatibilityMode: true,
      phase: '122.1',
    },
    testInputs: defaultTestInputs,
    nextMilestones: defaultNextMilestones,
    demo: {
      ok: true,
      finalRoute: '/cmt/master/secure',
      privacy: {
        decision: {
          decision: 'allow_local_only',
          hasSensitiveData: false,
          matches: [],
          sanitizedText: 'Lokale Status-Demo ohne externe Weitergabe.',
          reason: 'Local-only compatibility status. External sharing remains blocked.',
        },
        localOnly: true,
        externalSharingAllowed: false,
        providerEnabled: false,
        internetEnabled: false,
        liveModelEnabled: false,
      },
      requiresUserApproval: false,
      externalSharingAllowed: false,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      summary: 'Secure Master status compatibility object is available for legacy pages.',
    },
    safety: {
      localOnly: true,
      externalSharingAllowed: false,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      privacyGateActive: true,
      requiresUserApproval: false,
    },
    createdAt: new Date().toISOString(),
  };
}

export const getSecureMasterStatusDemo = getSecureMasterStatus;
export const createSecureMasterStatus = getSecureMasterStatus;
export default getSecureMasterStatus;
