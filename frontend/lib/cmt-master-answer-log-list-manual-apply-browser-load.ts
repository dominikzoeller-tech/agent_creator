import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogManualApplyBrowserLoadInput = {
  rawStoredValue?: string;
};

export type SecureMasterAnswerLogManualApplyBrowserLoadResult = {
  phase: '140.0';
  label: 'Secure Master Main Log List Manual JSON Apply Browser Load';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  loadState: {
    mainLogListManualApplyBrowserLoadPrepared: true;
    readsManualApplyPayloadFromBrowser: true;
    manualApplySourceRecognized: true;
    sourceLabelVisible: true;
    loadButtonVisible: true;
    browserReadPrepared: true;
    applyImportAutomatically: false;
    externalSharingAllowed: false;
    persistedInBrowser: 'browser_optional_local_after_manual_apply';
    persistedOnServer: false;
    serverStoragePrepared: false;
  };
  validation: {
    hasStoredValue: boolean;
    parseOk: boolean;
    sourceOk: boolean;
    hasValidation: boolean;
    hasPreview: boolean;
    itemCount: number;
    error: string | null;
  };
  preview: {
    source?: string;
    appliedAt?: string;
    itemCount?: number;
    sourceCount?: number;
    filteredCount?: number;
    schemaOk?: boolean;
    parseOk?: boolean;
  } | null;
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

export function loadSecureMasterAnswerLogManualApplyFromBrowser(input: SecureMasterAnswerLogManualApplyBrowserLoadInput): SecureMasterAnswerLogManualApplyBrowserLoadResult {
  const rawStoredValue = input.rawStoredValue || '';
  let parsed: any = null;
  let parseOk = false;
  let error: string | null = null;

  if (rawStoredValue.trim()) {
    try {
      parsed = JSON.parse(rawStoredValue);
      parseOk = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'JSON parse failed';
    }
  }

  const sourceOk = Boolean(parseOk && parsed?.source === 'manual_json_import_apply_prepared_phase_139_0');
  const validation = parsed?.validation;
  const preview = parsed?.preview;
  const itemCount = typeof validation?.itemCount === 'number' ? validation.itemCount : 0;

  return {
    phase: '140.0',
    label: 'Secure Master Main Log List Manual JSON Apply Browser Load',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    loadState: {
      mainLogListManualApplyBrowserLoadPrepared: true,
      readsManualApplyPayloadFromBrowser: true,
      manualApplySourceRecognized: true,
      sourceLabelVisible: true,
      loadButtonVisible: true,
      browserReadPrepared: true,
      applyImportAutomatically: false,
      externalSharingAllowed: false,
      persistedInBrowser: 'browser_optional_local_after_manual_apply',
      persistedOnServer: false,
      serverStoragePrepared: false,
    },
    validation: {
      hasStoredValue: Boolean(rawStoredValue.trim()),
      parseOk,
      sourceOk,
      hasValidation: Boolean(validation),
      hasPreview: Boolean(preview),
      itemCount,
      error,
    },
    preview: parseOk ? {
      source: parsed?.source,
      appliedAt: parsed?.appliedAt,
      itemCount,
      sourceCount: preview?.sourceCount,
      filteredCount: preview?.filteredCount,
      schemaOk: validation?.schemaOk,
      parseOk: validation?.parseOk,
    } : null,
    safety: {
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    note: 'Phase 140.0 bereitet das Laden manuell angewendeter Import-Payloads aus dem Browser-Speicher fuer die Haupt-Logliste vor. Keine externe Weitergabe.',
  };
}

export function getSecureMasterAnswerLogManualApplyBrowserLoadDemo() {
  return loadSecureMasterAnswerLogManualApplyFromBrowser({
    rawStoredValue: JSON.stringify({
      appliedAt: 'demo',
      source: 'manual_json_import_apply_prepared_phase_139_0',
      validation: { parseOk: true, schemaOk: true, itemCount: 2 },
      preview: { sourceCount: 2, filteredCount: 2, exportedAt: 'demo' },
    }, null, 2),
  });
}
