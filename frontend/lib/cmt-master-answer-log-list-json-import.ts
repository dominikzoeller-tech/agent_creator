import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonImportInput = {
  rawJson?: string;
};

export type SecureMasterAnswerLogJsonImportResult = {
  phase: '138.0';
  label: 'Secure Master Answer Log JSON Import Preparation';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  schemaExpected: 'cmt.secureMaster.answerLogList.export.v1';
  importState: {
    importPrepared: true;
    importUiVisible: true;
    schemaCheckPrepared: true;
    importPreviewPrepared: true;
    applyImportAutomatically: false;
    manualApplyRequiredLater: true;
    browserStorePreserved: true;
    persistedInBrowser: 'browser_optional_local';
    persistedOnServer: false;
    serverStoragePrepared: false;
  };
  validation: {
    hasRawJson: boolean;
    parseOk: boolean;
    schemaOk: boolean;
    error: string | null;
    itemCount: number;
    hasFilters: boolean;
    hasPersistenceState: boolean;
    hasSafetyState: boolean;
  };
  preview: {
    schema?: string;
    phase?: string;
    exportedAt?: string;
    sourceCount?: number;
    filteredCount?: number;
    persistedOnServer?: boolean;
    externalSharingAllowed?: boolean;
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

export function prepareSecureMasterAnswerLogJsonImport(input: SecureMasterAnswerLogJsonImportInput): SecureMasterAnswerLogJsonImportResult {
  const rawJson = input.rawJson || '';
  let parsed: any = null;
  let parseOk = false;
  let error: string | null = null;

  if (rawJson.trim()) {
    try {
      parsed = JSON.parse(rawJson);
      parseOk = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'JSON parse failed';
    }
  }

  const schemaOk = Boolean(parseOk && parsed?.schema === 'cmt.secureMaster.answerLogList.export.v1');
  const filter = parsed?.mainBrowserStore?.browserStore?.mainSelect?.select?.filter;
  const itemCount = Array.isArray(filter?.items) ? filter.items.length : 0;
  const exportState = parsed?.exportState;
  const safety = parsed?.safety;

  return {
    phase: '138.0',
    label: 'Secure Master Answer Log JSON Import Preparation',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    schemaExpected: 'cmt.secureMaster.answerLogList.export.v1',
    importState: {
      importPrepared: true,
      importUiVisible: true,
      schemaCheckPrepared: true,
      importPreviewPrepared: true,
      applyImportAutomatically: false,
      manualApplyRequiredLater: true,
      browserStorePreserved: true,
      persistedInBrowser: 'browser_optional_local',
      persistedOnServer: false,
      serverStoragePrepared: false,
    },
    validation: {
      hasRawJson: Boolean(rawJson.trim()),
      parseOk,
      schemaOk,
      error,
      itemCount,
      hasFilters: Boolean(filter),
      hasPersistenceState: Boolean(exportState),
      hasSafetyState: Boolean(safety),
    },
    preview: parseOk ? {
      schema: parsed?.schema,
      phase: parsed?.phase,
      exportedAt: parsed?.exportedAt,
      sourceCount: filter?.sourceCount,
      filteredCount: filter?.filteredCount,
      persistedOnServer: exportState?.persistedOnServer,
      externalSharingAllowed: safety?.externalSharingAllowed,
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
    note: 'Phase 138.0 bereitet den lokalen JSON-Import vor. Der Import wird nur geprueft und angezeigt, aber nicht automatisch angewendet.',
  };
}

export function getSecureMasterAnswerLogJsonImportDemo() {
  return prepareSecureMasterAnswerLogJsonImport({
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
