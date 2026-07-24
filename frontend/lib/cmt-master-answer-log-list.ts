import { createSecureMasterAnswerLog, type SecureMasterAnswerLogEntry } from './cmt-master-answer-log';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogListItem = Pick<SecureMasterAnswerLogEntry,
  'id' | 'createdAt' | 'inputPreview' | 'option' | 'detectedIntent' | 'finalRoute' | 'privacyDecision' | 'badgeSummary' | 'safety'
>;

export type SecureMasterAnswerLogListResult = {
  phaseList: '130.0';
  label: 'Secure Master In-Memory Answer Log List';
  items: SecureMasterAnswerLogListItem[];
  count: number;
  localOnly: true;
  persistedInBrowser: false;
  persistedOnServer: false;
  note: string;
  safety: {
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
};

export function createSecureMasterAnswerLogList(inputs: { input: string; option?: PrivacyDecisionOption }[]): SecureMasterAnswerLogListResult {
  const items = inputs.map((item, index) => {
    const result = createSecureMasterAnswerLog(
      item.input,
      item.option ?? 'local_only',
      new Date(Date.UTC(2026, 6, 24, 12, index, 0))
    );
    const entry = result.entry;
    return {
      id: entry.id,
      createdAt: entry.createdAt,
      inputPreview: entry.inputPreview,
      option: entry.option,
      detectedIntent: entry.detectedIntent,
      finalRoute: entry.finalRoute,
      privacyDecision: entry.privacyDecision,
      badgeSummary: entry.badgeSummary,
      safety: entry.safety,
    };
  });

  return {
    phaseList: '130.0',
    label: 'Secure Master In-Memory Answer Log List',
    items,
    count: items.length,
    localOnly: true,
    persistedInBrowser: false,
    persistedOnServer: false,
    note: 'Phase 130.0 zeigt mehrere lokale Log-Objekte als In-Memory-Liste. Keine dauerhafte Speicherung, kein Provider, kein Internet, kein Live-Modell.',
    safety: {
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
  };
}

export function getSecureMasterAnswerLogListDemo() {
  return createSecureMasterAnswerLogList([
    { input: 'Was kannst du als Secure Master aktuell?', option: 'local_only' },
    { input: 'Soll ich den Secure Master Agent jetzt live schalten?', option: 'local_only' },
    { input: 'Hier sind interne Kundendaten. Was darfst du damit machen?', option: 'local_only' },
    { input: 'Soll ich fuer diese Entscheidung das Gremium fragen?', option: 'local_only' },
  ]);
}
