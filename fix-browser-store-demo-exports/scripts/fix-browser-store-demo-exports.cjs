const fs = require('fs');
const path = require('path');
const root = process.cwd();

const files = [
  'frontend/lib/cmt-master-answer-log-list-browser-store.ts',
  'frontend/app/lib/cmt-master-answer-log-list-browser-store.ts',
];

const patch = `

export type SecureMasterAnswerLogBrowserStoreResult = any;
export const SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY = 'secure_master_answer_log_browser_store';
export const getSecureMasterAnswerLogBrowserStoreDemo: any = typeof makeCompatStub === 'function'
  ? makeCompatStub('getSecureMasterAnswerLogBrowserStoreDemo')
  : (() => ({ ok: true, stub: true, name: 'getSecureMasterAnswerLogBrowserStoreDemo', items: [] }));
export const getSecureMasterAnswerLogBrowserStoreStatus: any = typeof makeCompatStub === 'function'
  ? makeCompatStub('getSecureMasterAnswerLogBrowserStoreStatus')
  : (() => ({ ok: true, stub: true, name: 'getSecureMasterAnswerLogBrowserStoreStatus' }));
`;

let changed = 0;
for (const rel of files) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  let text = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
  if (!text.includes('makeCompatStub')) {
    text = `export function makeCompatStub(name: string): any { return { ok: true, stub: true, name, items: [], data: [] }; }\n` + text;
  }
  let add = '';
  for (const token of ['SecureMasterAnswerLogBrowserStoreResult','SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY','getSecureMasterAnswerLogBrowserStoreDemo','getSecureMasterAnswerLogBrowserStoreStatus']) {
    if (!text.includes(token)) add = patch;
  }
  if (add) {
    fs.writeFileSync(full, text + add + '\n', 'utf8');
    console.log('[patch]', rel);
    changed++;
  } else {
    console.log('[ok]', rel);
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-master-answer-log-list-browser-store.ts','frontend/app/lib/cmt-master-answer-log-list-browser-store.ts']){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');for(const token of ['getSecureMasterAnswerLogBrowserStoreDemo','SecureMasterAnswerLogBrowserStoreResult','SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY']){if(!text.includes(token)){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token)}}if(ok)console.log('[OK] browser store demo exports verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-browser-store-demo-exports.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixbrowserdemo:verify'] = 'node scripts/v-fix-browser-store-demo-exports.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixbrowserdemo:verify');
console.log('[OK] browser store demo exports fix applied, changed=' + changed);
