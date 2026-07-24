import { prepareSecureMasterAnswerLogJsonImport, type SecureMasterAnswerLogJsonImportResult } from './cmt-master-answer-log-list-json-import';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonImportApplyInput = {
  rawJson?: string;
};

export type SecureMasterAnswerLogJsonImportApplyResult = {
  phase: '139.0';
  label: 'Secure Master Answer Log JSON Import Manual Browser Apply Preparation';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  importPreview: SecureMasterAnswerLogJsonImportResult;
  applyState: {
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
  applyPayloadPreview: {
    canApply: boolean;
    reason: string;
    storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
    itemCount: number;
    sourceCount?: number;
    filteredCount?: number;
    exportedAt?: string;
  };
  safety: {
    localOnly: true;
    providerEnabled: false;
    internetEnabled: false;
    liveModelEnabled: false;
    networkCallAllowed: false;
    externalSharingAllowed: false;
    finalDispatchBlocked: true;
  };
  note: string;
};

export function prepareSecureMasterAnswerLogJsonImportApply(input: SecureMasterAnswerLogJsonImportApplyInput): SecureMasterAnswerLogJsonImportApplyResult {
  const importPreview = prepareSecureMasterAnswerLogJsonImport({ rawJson: input.rawJson || '' });
  const canApply = importPreview.validation.parseOk && importPreview.validation.schemaOk;
  const preview = importPreview.preview;

  return {
    phase: '139.0',
    label: 'Secure Master Answer Log JSON Import Manual Browser Apply Preparation',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    importPreview,
    applyState: {
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
    applyPayloadPreview: {
      canApply,
      reason: canApply ? 'Export-JSON ist parsebar und Schema ist gueltig. Manuelle Uebernahme in Browser-Speicher ist vorbereitet.' : 'Export-JSON ist noch nicht gueltig fuer manuelle Uebernahme.',
      storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
      itemCount: importPreview.validation.itemCount,
      sourceCount: preview?.sourceCount,
      filteredCount: preview?.filteredCount,
      exportedAt: preview?.exportedAt,
    },
    safety: {
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    note: 'Phase 139.0 bereitet die manuelle Uebernahme validierter Export-JSON-Daten in den Browser-Speicher vor. Kein automatischer Import.',
  };
}

export function getSecureMasterAnswerLogJsonImportApplyDemo() {
  return prepareSecureMasterAnswerLogJsonImportApply({
    rawJson: JSON.stringify({
      schema: 'cmt.secureMaster.answerLogList.export.v1',
      phase: '137.0',
      exportedAt: 'demo',
      exportState: { persistedOnServer: false },
      safety: { externalSharingAllowed: false },
      mainBrowserStore: {
        browserStore: {
          mainSelect: {
            select: {
              filter: { sourceCount: 2, filteredCount: 2, items: [{ id: 'demo-1' }, { id: 'demo-2' }] },
            },
          },
        },
      },
    }, null, 2),
  });
}
