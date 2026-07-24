import { getSecureMasterAnswerLogJsonImportApplyStatus, type SecureMasterAnswerLogJsonImportApplyStatus } from './cmt-master-answer-log-list-json-import-apply-status';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonImportApplyEntry = {
  phase: '139.2';
  label: 'Secure Master Answer Log JSON Import Manual Browser Apply Entry';
  status: SecureMasterAnswerLogJsonImportApplyStatus;
  primaryApplyPage: '/cmt/master/secure/main/log/list/import-json/apply';
  applyStatusPage: '/cmt/master/secure/main/log/list/import-json/apply/status';
  importPage: '/cmt/master/secure/main/log/list/import-json';
  importStatusPage: '/cmt/master/secure/main/log/list/import-json/status';
  exportPage: '/cmt/master/secure/main/log/list/export-json';
  mainLogListPage: '/cmt/master/secure/main/log/list';
  secureMasterPage: '/cmt/master/secure';
  applyApi: '/api/cmt/master/secure/main/log/list/import-json/apply';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  recommendedUse: string[];
  uiChecklist: string[];
  applyState: {
    jsonImportManualApplyEntryVisible: true;
    manualApplyPrepared: true;
    applyButtonVisible: true;
    applyRequiresValidSchema: true;
    applyRequiresParseOk: true;
    applyImportAutomatically: false;
    previewVisibleBeforeApply: true;
    validationVisibleBeforeApply: true;
    localStorageWritePrepared: true;
    browserStorePreserved: true;
    persistedInBrowser: 'browser_optional_local_after_manual_apply';
    persistedOnServer: false;
    serverStoragePrepared: false;
  };
  safety: {
    localTestable: true;
    localOnly: true;
    providerEnabled: false;
    internetEnabled: false;
    liveModelEnabled: false;
    networkCallAllowed: false;
    externalSharingAllowed: false;
    finalDispatchBlocked: true;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogJsonImportApplyEntry(): SecureMasterAnswerLogJsonImportApplyEntry {
  return {
    phase: '139.2',
    label: 'Secure Master Answer Log JSON Import Manual Browser Apply Entry',
    status: getSecureMasterAnswerLogJsonImportApplyStatus(),
    primaryApplyPage: '/cmt/master/secure/main/log/list/import-json/apply',
    applyStatusPage: '/cmt/master/secure/main/log/list/import-json/apply/status',
    importPage: '/cmt/master/secure/main/log/list/import-json',
    importStatusPage: '/cmt/master/secure/main/log/list/import-json/status',
    exportPage: '/cmt/master/secure/main/log/list/export-json',
    mainLogListPage: '/cmt/master/secure/main/log/list',
    secureMasterPage: '/cmt/master/secure',
    applyApi: '/api/cmt/master/secure/main/log/list/import-json/apply',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    recommendedUse: [
      'Manual-Apply-Seite als lokalen Uebernahmepunkt fuer validierte Export-JSON-Daten nutzen.',
      'Apply Preview vorbereiten und Validation kontrollieren.',
      'Nur bei parseOk=true und schemaOk=true manuell in Browser speichern.',
      'Vor dem Anwenden Preview und Validation sichtbar halten.',
      'Statusseite zur Kontrolle der Apply-Flags nutzen.',
      'Haupt-Logliste nach manueller Uebernahme separat pruefen.',
      'Keinen automatischen Import erwarten.',
      'Server-Persistenz weiterhin nicht erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    uiChecklist: [
      'Manual-Apply-Entry sichtbar.',
      'Manual-Apply-Seite verlinkt.',
      'Manual-Apply-Status verlinkt.',
      'JSON-Import-Seite verlinkt.',
      'JSON-Export-Seite verlinkt.',
      'Haupt-Logliste verlinkt.',
      'Storage Key sichtbar.',
      'manualApplyPrepared = true sichtbar.',
      'applyButtonVisible = true sichtbar.',
      'applyRequiresValidSchema = true sichtbar.',
      'applyRequiresParseOk = true sichtbar.',
      'applyImportAutomatically = false sichtbar.',
      'previewVisibleBeforeApply = true sichtbar.',
      'validationVisibleBeforeApply = true sichtbar.',
      'localStorageWritePrepared = true sichtbar.',
      'persistedOnServer = false sichtbar.',
      'externalSharingAllowed = false sichtbar.',
    ],
    applyState: {
      jsonImportManualApplyEntryVisible: true,
      manualApplyPrepared: true,
      applyButtonVisible: true,
      applyRequiresValidSchema: true,
      applyRequiresParseOk: true,
      applyImportAutomatically: false,
      previewVisibleBeforeApply: true,
      validationVisibleBeforeApply: true,
      localStorageWritePrepared: true,
      browserStorePreserved: true,
      persistedInBrowser: 'browser_optional_local_after_manual_apply',
      persistedOnServer: false,
      serverStoragePrepared: false,
    },
    safety: {
      localTestable: true,
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    nextMilestone: 'Phase 139.3: Secure Master Answer Log JSON Import Manual Browser Apply Handoff',
  };
}
