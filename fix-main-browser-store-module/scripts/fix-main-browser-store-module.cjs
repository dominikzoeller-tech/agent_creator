const fs = require('fs');
const path = require('path');
const root = process.cwd();

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

const content = `import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogMainBrowserStoreResult = {
  ok: true;
  stub: true;
  phase: 'main-browser-store-compat';
  storageKey: string;
  items: any[];
  count: number;
  createdAt: string;
};

export function createSecureMasterAnswerLogMainBrowserStore(items: any[] = []): SecureMasterAnswerLogMainBrowserStoreResult {
  return {
    ok: true,
    stub: true,
    phase: 'main-browser-store-compat',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    items: Array.isArray(items) ? items : [],
    count: Array.isArray(items) ? items.length : 0,
    createdAt: new Date().toISOString(),
  };
}

export const getSecureMasterAnswerLogMainBrowserStore = createSecureMasterAnswerLogMainBrowserStore;
export const getSecureMasterAnswerLogListMainBrowserStore = createSecureMasterAnswerLogMainBrowserStore;
export default createSecureMasterAnswerLogMainBrowserStore;
`;

write('frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', content);
write('frontend/app/lib/cmt-master-answer-log-list-main-browser-store.ts', content.replace("./cmt-master-answer-log-list-browser-store", "./cmt-master-answer-log-list-browser-store"));

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts','frontend/app/lib/cmt-master-answer-log-list-main-browser-store.ts']){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');for(const token of ['createSecureMasterAnswerLogMainBrowserStore','SecureMasterAnswerLogMainBrowserStoreResult','SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY']){if(!text.includes(token)){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token)}}if(ok)console.log('[OK] main browser store module verify passed');process.exit(ok?0:1);`;
write('scripts/v-fix-main-browser-store-module.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixmainbrowserstore:verify'] = 'node scripts/v-fix-main-browser-store-module.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixmainbrowserstore:verify');
console.log('[OK] main browser store module fix applied');
