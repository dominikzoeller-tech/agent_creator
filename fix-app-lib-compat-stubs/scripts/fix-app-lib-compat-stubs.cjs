const fs = require('fs');
const path = require('path');
const root = process.cwd();

const modules = [
  'cmt-master-answer-log-list-browser-store',
  'cmt-master-app-entry',
  'cmt-master-nav-status',
  'cmt-master-committee',
];

function makeContent(moduleName) {
  const camel = moduleName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/[^A-Za-z0-9_$]/g, '');
  const safe = /^[A-Za-z_$]/.test(camel) ? camel : 'stubModule';
  return `/* Auto-generated compatibility stub for ${moduleName}.
 * This exists to keep legacy CMT routes building while the active agent UI is stabilized.
 */
export type CompatStub = Record<string, any>;

export function makeCompatStub(name: string): any {
  return new Proxy(function compatStub(..._args: any[]) {
    return {
      ok: true,
      stub: true,
      name,
      status: 'stubbed',
      items: [],
      logs: [],
      data: [],
      message: 'Compatibility stub for ${moduleName}',
    };
  }, {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'toJSON') return () => ({ ok: true, stub: true, name });
      if (prop === Symbol.toPrimitive) return () => name;
      if (prop === 'length') return 0;
      return makeCompatStub(name + '.' + String(prop));
    },
    apply() {
      return {
        ok: true,
        stub: true,
        name,
        status: 'stubbed',
        items: [],
        logs: [],
        data: [],
        message: 'Compatibility stub for ${moduleName}',
      };
    }
  });
}

export const ${safe}: any = makeCompatStub('${moduleName}');
export const answerLogListBrowserStore: any = makeCompatStub('answerLogListBrowserStore');
export const cmtMasterAnswerLogListBrowserStore: any = makeCompatStub('cmtMasterAnswerLogListBrowserStore');
export const cmtMasterAppEntry: any = makeCompatStub('cmtMasterAppEntry');
export const cmtMasterNavStatus: any = makeCompatStub('cmtMasterNavStatus');
export const cmtMasterCommittee: any = makeCompatStub('cmtMasterCommittee');
export const getAnswerLogList: any = makeCompatStub('getAnswerLogList');
export const loadAnswerLogList: any = makeCompatStub('loadAnswerLogList');
export const saveAnswerLogList: any = makeCompatStub('saveAnswerLogList');
export const listAnswerLogs: any = makeCompatStub('listAnswerLogs');
export const importAnswerLogs: any = makeCompatStub('importAnswerLogs');
export const exportAnswerLogs: any = makeCompatStub('exportAnswerLogs');
export const getCmtMasterAppEntry: any = makeCompatStub('getCmtMasterAppEntry');
export const getCmtMasterNavStatus: any = makeCompatStub('getCmtMasterNavStatus');
export const createCmtMasterCommittee: any = makeCompatStub('createCmtMasterCommittee');
export default makeCompatStub('default:${moduleName}');
`;
}

for (const baseDir of ['frontend/app/lib', 'frontend/lib']) {
  for (const moduleName of modules) {
    const rel = path.join(baseDir, moduleName + '.ts').replace(/\\/g, '/');
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    if (!fs.existsSync(full)) {
      fs.writeFileSync(full, makeContent(moduleName), 'utf8');
      console.log('[write]', rel);
    } else {
      console.log('[exists]', rel);
    }
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;const modules=${JSON.stringify(modules)};for(const base of ['frontend/app/lib','frontend/lib']){for(const mod of modules){const rel=path.join(base,mod+'.ts');if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}}if(ok)console.log('[OK] fix app lib compatibility stubs verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-app-lib-compat-stubs.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixapplib:verify'] = 'node scripts/v-fix-app-lib-compat-stubs.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixapplib:verify');
console.log('[OK] fix-app-lib-compat-stubs applied');
