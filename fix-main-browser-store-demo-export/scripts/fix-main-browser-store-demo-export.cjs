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
`;

write('frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', content);
write('frontend/app/lib/cmt-master-answer-log-list-main-browser-store.ts', content);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts','frontend/app/lib/cmt-master-answer-log-list-main-browser-store.ts']){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');for(const token of ['getSecureMasterAnswerLogMainBrowserStoreDemo','SecureMasterAnswerLogMainBrowserStoreResult','getSecureMasterAnswerLogMainBrowserStoreStatus','input: any = []']){if(!text.includes(token)){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token)}const names=[...text.matchAll(/export\\s+(?:const|function|type|interface|class)\\s+([A-Za-z_$][\\w$]*)/g)].map(m=>m[1]);const dupes=names.filter((n,i)=>names.indexOf(n)!==i);if(dupes.length){console.error('[duplicate exports]',rel,[...new Set(dupes)].join(','));ok=false}else console.log('[ok] no duplicate export declarations',rel)}if(ok)console.log('[OK] main browser store demo export verify passed');process.exit(ok?0:1);`;
write('scripts/v-fix-main-browser-store-demo-export.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixmainbrowserdemo:verify'] = 'node scripts/v-fix-main-browser-store-demo-export.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixmainbrowserdemo:verify');
console.log('[OK] main browser store demo export fix applied');
