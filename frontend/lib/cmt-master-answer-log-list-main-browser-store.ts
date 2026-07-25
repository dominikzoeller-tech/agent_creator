import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogMainBrowserStoreResult = {
  ok: true;
  stub: true;
  phase: 'main-browser-store-compat';
  storageKey: string;
  sourceInput: any;
  items: any[];
  count: number;
  createdAt: string;
};

export type SecureMasterAnswerLogMainBrowserStoreStatus = {
  ok: true;
  phase: 'main-browser-store-status-compat';
  storageKey: string;
  available: true;
  createdAt: string;
};

function normalizeItems(input: any): any[] {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.items)) return input.items;
  if (Array.isArray(input?.entries)) return input.entries;
  if (Array.isArray(input?.logs)) return input.logs;
  if (input && typeof input === 'object') return [input];
  return [];
}

export function createSecureMasterAnswerLogMainBrowserStore(input: any = []): SecureMasterAnswerLogMainBrowserStoreResult {
  const items = normalizeItems(input);
  return {
    ok: true,
    stub: true,
    phase: 'main-browser-store-compat',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    sourceInput: input,
    items,
    count: items.length,
    createdAt: new Date().toISOString(),
  };
}

export function getSecureMasterAnswerLogMainBrowserStoreDemo(input: any = []): SecureMasterAnswerLogMainBrowserStoreResult {
  return createSecureMasterAnswerLogMainBrowserStore(input);
}

export function getSecureMasterAnswerLogListMainBrowserStoreDemo(input: any = []): SecureMasterAnswerLogMainBrowserStoreResult {
  return createSecureMasterAnswerLogMainBrowserStore(input);
}

export function getSecureMasterAnswerLogMainBrowserStoreStatus(): SecureMasterAnswerLogMainBrowserStoreStatus {
  return {
    ok: true,
    phase: 'main-browser-store-status-compat',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    available: true,
    createdAt: new Date().toISOString(),
  };
}

export const getSecureMasterAnswerLogMainBrowserStore = createSecureMasterAnswerLogMainBrowserStore;
export const getSecureMasterAnswerLogListMainBrowserStore = createSecureMasterAnswerLogMainBrowserStore;
export default createSecureMasterAnswerLogMainBrowserStore;
