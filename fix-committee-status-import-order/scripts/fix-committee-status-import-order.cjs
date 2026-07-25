const fs = require('fs');
const path = require('path');
const root = process.cwd();

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

const content = `import { getSecureMasterCommitteeDemo } from './cmt-master-committee';
import type { SecureMasterCommitteeResult } from './cmt-master-committee';

export type SecureMasterCommitteeStatus = {
  phase: '125.1';
  ok: true;
  committeeAvailable: boolean;
  demo: SecureMasterCommitteeResult;
  checkedAt: string;
  message: string;
};

export function getSecureMasterCommitteeStatus(): SecureMasterCommitteeStatus {
  return {
    phase: '125.1',
    ok: true,
    committeeAvailable: true,
    demo: getSecureMasterCommitteeDemo(),
    checkedAt: new Date().toISOString(),
    message: 'Secure Master Committee legacy status compatibility is available.',
  };
}

export const createSecureMasterCommitteeStatus = getSecureMasterCommitteeStatus;
export default getSecureMasterCommitteeStatus;
`;

write('frontend/lib/cmt-master-committee-status.ts', content);
write('frontend/app/lib/cmt-master-committee-status.ts', content);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-master-committee-status.ts','frontend/app/lib/cmt-master-committee-status.ts']){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');if(!text.startsWith("import { getSecureMasterCommitteeDemo }")){console.error('[bad import order]',rel);ok=false}else console.log('[ok import order]',rel);for(const token of ['getSecureMasterCommitteeStatus','SecureMasterCommitteeStatus','createSecureMasterCommitteeStatus']){if(!text.includes(token)){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token)}}if(ok)console.log('[OK] committee status import order verify passed');process.exit(ok?0:1);`;
write('scripts/v-fix-committee-status-import-order.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixcommitteestatus:verify'] = 'node scripts/v-fix-committee-status-import-order.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixcommitteestatus:verify');
console.log('[OK] committee status import order fix applied');
