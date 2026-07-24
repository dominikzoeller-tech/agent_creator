import { askSecureMasterMainView, type SecureMasterMainViewModel } from './cmt-master-main-view-model';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogEntry = {
  id: string;
  phase: '129.0';
  createdAt: string;
  inputPreview: string;
  option: PrivacyDecisionOption;
  detectedIntent: string;
  finalRoute: string;
  privacyDecision: string;
  badgeSummary: string[];
  safety: {
    liveModelEnabled: boolean;
    externalSharingAllowed: boolean;
    networkCallAllowed: boolean;
    providerDispatchAllowed: boolean;
    finalDispatchBlocked: boolean;
  };
  result: SecureMasterMainViewModel;
};

export type SecureMasterAnswerLogResult = {
  phaseLog: '129.0';
  label: 'Secure Master Local Answer Log';
  entry: SecureMasterAnswerLogEntry;
  localOnly: true;
  persistedInBrowser: false;
  persistedOnServer: false;
  note: string;
};

function makeId(input: string, date: Date) {
  const seed = input.trim().slice(0, 32).replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'secure-master';
  return 'log-' + date.toISOString().replace(/[^0-9]/g, '').slice(0, 14) + '-' + seed;
}

function badgeSummary(result: SecureMasterMainViewModel) {
  return result.badges.map((badge) => badge.label + '=' + badge.value + ' [' + badge.tone + ']');
}

export function createSecureMasterAnswerLog(input: string, option: PrivacyDecisionOption = 'local_only', now = new Date()): SecureMasterAnswerLogResult {
  const result = askSecureMasterMainView(input, option);
  const entry: SecureMasterAnswerLogEntry = {
    id: makeId(input, now),
    phase: '129.0',
    createdAt: now.toISOString(),
    inputPreview: input.trim().slice(0, 240),
    option,
    detectedIntent: result.detectedIntent,
    finalRoute: result.finalRoute,
    privacyDecision: result.privacy.decision.decision,
    badgeSummary: badgeSummary(result),
    safety: {
      liveModelEnabled: result.liveModelEnabled,
      externalSharingAllowed: result.externalSharingAllowed,
      networkCallAllowed: result.networkCallAllowed,
      providerDispatchAllowed: result.providerDispatchAllowed,
      finalDispatchBlocked: result.finalDispatchBlocked,
    },
    result,
  };

  return {
    phaseLog: '129.0',
    label: 'Secure Master Local Answer Log',
    entry,
    localOnly: true,
    persistedInBrowser: false,
    persistedOnServer: false,
    note: 'Phase 129.0 erzeugt ein lokales Protokollobjekt pro Anfrage. Noch keine dauerhafte Speicherung, kein Provider, kein Internet, kein Live-Modell.',
  };
}

export function getSecureMasterAnswerLogDemo() {
  return createSecureMasterAnswerLog('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?', 'local_only', new Date('2026-07-24T12:00:00.000Z'));
}
