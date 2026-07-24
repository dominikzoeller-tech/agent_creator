import { getSecureMasterUnifiedDemo, type SecureMasterUnifiedResult } from './cmt-master-unified';

export type SecureMasterUnifiedStatus = {
  phase: '126.1';
  label: 'Secure Master Unified Status';
  mainUnifiedPage: '/cmt/master/secure/unified';
  mainSecurePage: '/cmt/master/secure';
  apiRoute: '/api/cmt/master/secure/unified';
  demo: SecureMasterUnifiedResult;
  unifiedState: {
    mainFlowAvailable: true;
    privacyGateVisibleWhenNeeded: true;
    qualityAnswerVisible: true;
    committeeVisibleWhenNeeded: true;
    safetyStateVisible: true;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  visibleBlocks: string[];
  testPrompts: string[];
  nextMilestones: string[];
};

export function getSecureMasterUnifiedStatus(): SecureMasterUnifiedStatus {
  return {
    phase: '126.1',
    label: 'Secure Master Unified Status',
    mainUnifiedPage: '/cmt/master/secure/unified',
    mainSecurePage: '/cmt/master/secure',
    apiRoute: '/api/cmt/master/secure/unified',
    demo: getSecureMasterUnifiedDemo(),
    unifiedState: {
      mainFlowAvailable: true,
      privacyGateVisibleWhenNeeded: true,
      qualityAnswerVisible: true,
      committeeVisibleWhenNeeded: true,
      safetyStateVisible: true,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Der Secure Master Unified Flow ist lokal verfuegbar. Er kombiniert lokale Antwort, Routing, Privacy Gate, Gremium und Safety State ohne Provider oder Internet.',
    },
    visibleBlocks: [
      'Lokale Antwort',
      'Routing',
      'Privacy Gate bei Bedarf',
      '5er-Gremium bei Bedarf',
      'Safety',
    ],
    testPrompts: [
      'Was kannst du als Secure Master aktuell?',
      'Soll ich den Secure Master Agent jetzt live schalten?',
      'Hier sind interne Kundendaten. Darfst du extern damit arbeiten?',
      'Soll ich fuer diese Entscheidung das Gremium fragen?',
      'Wie ist morgen das Wetter?',
      'Baue mir spaeter einen Trading-Agenten.',
    ],
    nextMilestones: [
      'Unified Flow als echte Hauptansicht in /cmt/master/secure einbauen',
      'Alte Einzel-Testseiten weiter als Kontrollseiten behalten',
      'Antwortbloecke optisch klarer strukturieren',
      'Provider-Readiness weiter vorbereiten, aber blockiert lassen',
    ],
  };
}
