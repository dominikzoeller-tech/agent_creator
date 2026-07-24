import { createSecureMasterAnswerLogList, type SecureMasterAnswerLogListItem } from './cmt-master-answer-log-list';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterAnswerLogListFilterOptionsInput = {
  items: { input: string; option?: PrivacyDecisionOption }[];
};

export type SecureMasterAnswerLogListFilterOptionsResult = {
  phaseOptions: '132.0';
  label: 'Secure Master Local Answer Log List Filter Options';
  sourceCount: number;
  routes: string[];
  intents: string[];
  privacyDecisions: string[];
  items: SecureMasterAnswerLogListItem[];
  localOnly: true;
  persistedInBrowser: false;
  persistedOnServer: false;
  safety: {
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  note: string;
};

function uniqueSorted(values: string[]) {
  return ['all', ...Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))];
}

export function deriveSecureMasterAnswerLogListFilterOptions(input: SecureMasterAnswerLogListFilterOptionsInput): SecureMasterAnswerLogListFilterOptionsResult {
  const list = createSecureMasterAnswerLogList(input.items);

  return {
    phaseOptions: '132.0',
    label: 'Secure Master Local Answer Log List Filter Options',
    sourceCount: list.count,
    routes: uniqueSorted(list.items.map((item) => item.finalRoute)),
    intents: uniqueSorted(list.items.map((item) => item.detectedIntent)),
    privacyDecisions: uniqueSorted(list.items.map((item) => item.privacyDecision)),
    items: list.items,
    localOnly: true,
    persistedInBrowser: false,
    persistedOnServer: false,
    safety: {
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    note: 'Phase 132.0 leitet lokale Dropdown-Optionen aus der In-Memory-Logliste ab. Keine dauerhafte Speicherung, kein Provider, kein Internet, kein Live-Modell.',
  };
}

export function getSecureMasterAnswerLogListFilterOptionsDemo() {
  return deriveSecureMasterAnswerLogListFilterOptions({
    items: [
      { input: 'Was kannst du als Secure Master aktuell?', option: 'local_only' },
      { input: 'Soll ich den Secure Master Agent jetzt live schalten?', option: 'local_only' },
      { input: 'Hier sind interne Kundendaten. Was darfst du damit machen?', option: 'local_only' },
      { input: 'Soll ich fuer diese Entscheidung das Gremium fragen?', option: 'local_only' },
      { input: 'Wie ist morgen das Wetter?', option: 'local_only' },
      { input: 'Baue mir spaeter einen Trading-Agenten.', option: 'local_only' },
    ],
  });
}
