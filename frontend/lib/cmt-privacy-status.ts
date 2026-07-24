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
