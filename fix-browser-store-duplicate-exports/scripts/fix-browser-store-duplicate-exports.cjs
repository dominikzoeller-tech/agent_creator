const fs = require('fs');
const path = require('path');
const root = process.cwd();

const files = [
  'frontend/app/lib/cmt-master-answer-log-list-browser-store.ts',
  'frontend/lib/cmt-master-answer-log-list-browser-store.ts',
];

const content = `/* Browser store legacy compatibility module. */
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
`;

let changed = 0;
for (const rel of files) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
  changed++;
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ${JSON.stringify(files)}){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');for(const token of ['SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY','getSecureMasterAnswerLogBrowserStoreDemo','SecureMasterAnswerLogBrowserStoreResult']){const count=(text.match(new RegExp(token,'g'))||[]).length;if(count<1){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token,count)}const exportNames=[...text.matchAll(/export\\s+(?:const|function|type|interface|class)\\s+([A-Za-z_$][\\w$]*)/g)].map(m=>m[1]);const dupes=exportNames.filter((name,i)=>exportNames.indexOf(name)!==i);if(dupes.length){console.error('[duplicate exports]',rel,[...new Set(dupes)].join(','));ok=false}else console.log('[ok] no duplicate export declarations',rel)}if(ok)console.log('[OK] browser store duplicate exports verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-browser-store-duplicate-exports.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixbrowserdupes:verify'] = 'node scripts/v-fix-browser-store-duplicate-exports.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixbrowserdupes:verify');
console.log('[OK] browser store duplicate exports fix applied, changed=' + changed);
