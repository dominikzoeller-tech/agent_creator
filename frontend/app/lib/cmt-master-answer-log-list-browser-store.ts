/* Browser store legacy compatibility module. */
export function makeCompatStub(name: string): any {
  return new Proxy(function compatStub(..._args: any[]) {
    return { ok: true, stub: true, name, status: 'stubbed', items: [], logs: [], data: [], message: 'Browser store compatibility stub' };
  }, {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'toJSON') return () => ({ ok: true, stub: true, name });
      if (prop === Symbol.toPrimitive) return () => name;
      if (prop === 'length') return 0;
      return makeCompatStub(name + '.' + String(prop));
    },
    apply() {
      return { ok: true, stub: true, name, status: 'stubbed', items: [], logs: [], data: [], message: 'Browser store compatibility stub' };
    }
  });
}

export type SecureMasterAnswerLogBrowserStoreResult = any;
export type SecureMasterAnswerLogListBrowserStoreResult = any;
export type SecureMasterAnswerLogBrowserStoreStatus = any;
export type SecureMasterAnswerLogListBrowserStoreStatus = any;

export const SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY = 'secure_master_answer_log_browser_store';
export const SECURE_MASTER_ANSWER_LOG_LIST_BROWSER_STORAGE_KEY = 'secure_master_answer_log_list_browser_store';

export const answerLogListBrowserStore: any = makeCompatStub('answerLogListBrowserStore');
export const cmtMasterAnswerLogListBrowserStore: any = makeCompatStub('cmtMasterAnswerLogListBrowserStore');
export const getAnswerLogList: any = makeCompatStub('getAnswerLogList');
export const loadAnswerLogList: any = makeCompatStub('loadAnswerLogList');
export const saveAnswerLogList: any = makeCompatStub('saveAnswerLogList');
export const listAnswerLogs: any = makeCompatStub('listAnswerLogs');
export const importAnswerLogs: any = makeCompatStub('importAnswerLogs');
export const exportAnswerLogs: any = makeCompatStub('exportAnswerLogs');

export const getSecureMasterAnswerLogBrowserStore: any = makeCompatStub('getSecureMasterAnswerLogBrowserStore');
export const getSecureMasterAnswerLogBrowserStoreDemo: any = makeCompatStub('getSecureMasterAnswerLogBrowserStoreDemo');
export const getSecureMasterAnswerLogBrowserStoreStatus: any = makeCompatStub('getSecureMasterAnswerLogBrowserStoreStatus');
export const getSecureMasterAnswerLogListBrowserStore: any = makeCompatStub('getSecureMasterAnswerLogListBrowserStore');
export const getSecureMasterAnswerLogListBrowserStoreDemo: any = makeCompatStub('getSecureMasterAnswerLogListBrowserStoreDemo');
export const getSecureMasterAnswerLogListBrowserStoreStatus: any = makeCompatStub('getSecureMasterAnswerLogListBrowserStoreStatus');

export default makeCompatStub('default:cmt-master-answer-log-list-browser-store');
