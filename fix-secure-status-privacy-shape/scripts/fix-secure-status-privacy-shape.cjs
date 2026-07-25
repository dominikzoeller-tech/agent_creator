const fs = require('fs');
const path = require('path');
const root = process.cwd();

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}

const content = `export type SecureMasterStatusPrivacyDecision = {
  decision: 'allow_local_only' | 'block_external';
  hasSensitiveData: boolean;
  matches: string[];
  sanitizedText: string;
  reason: string;
};

export type SecureMasterStatusPrivacy = {
  decision: SecureMasterStatusPrivacyDecision;
  localOnly: true;
  externalSharingAllowed: false;
  providerEnabled: false;
  internetEnabled: false;
  liveModelEnabled: false;
};

export type SecureMasterStatusDemo = {
  ok: true;
  finalRoute: string;
  privacy: SecureMasterStatusPrivacy;
  requiresUserApproval: boolean;
  externalSharingAllowed: false;
  providerEnabled: false;
  internetEnabled: false;
  liveModelEnabled: false;
  summary: string;
};

export type SecureMasterStatus = {
  phase: 'secure-master-status-compat';
  ok: true;
  label: string;
  demo: SecureMasterStatusDemo;
  createdAt: string;
};

export function getSecureMasterStatus(): SecureMasterStatus {
  return {
    phase: 'secure-master-status-compat',
    ok: true,
    label: 'Secure Master Status',
    demo: {
      ok: true,
      finalRoute: '/cmt/master/secure',
      privacy: {
        decision: {
          decision: 'allow_local_only',
          hasSensitiveData: false,
          matches: [],
          sanitizedText: 'Lokale Status-Demo ohne externe Weitergabe.',
          reason: 'Local-only compatibility status. External sharing remains blocked.',
        },
        localOnly: true,
        externalSharingAllowed: false,
        providerEnabled: false,
        internetEnabled: false,
        liveModelEnabled: false,
      },
      requiresUserApproval: false,
      externalSharingAllowed: false,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      summary: 'Secure Master status compatibility object is available for legacy pages.',
    },
    createdAt: new Date().toISOString(),
  };
}

export const getSecureMasterStatusDemo = getSecureMasterStatus;
export const createSecureMasterStatus = getSecureMasterStatus;
export default getSecureMasterStatus;
`;

write('frontend/lib/cmt-master-secure-status.ts', content);
write('frontend/app/lib/cmt-master-secure-status.ts', content);

// If older pages import from cmt-master-secure directly, append a compatible status export there too without touching existing code too much.
for (const rel of ['frontend/lib/cmt-master-secure.ts', 'frontend/app/lib/cmt-master-secure.ts']) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  let text = fs.readFileSync(full, 'utf8');
  if (!text.includes('getSecureMasterStatusDemo')) {
    text += `\n\nexport { getSecureMasterStatus, getSecureMasterStatusDemo, createSecureMasterStatus } from './cmt-master-secure-status';\n`;
    fs.writeFileSync(full, text, 'utf8');
    console.log('[patch]', rel);
  } else {
    console.log('[ok]', rel);
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-master-secure-status.ts','frontend/app/lib/cmt-master-secure-status.ts']){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');for(const token of ['privacy: SecureMasterStatusPrivacy','decision: SecureMasterStatusPrivacyDecision','getSecureMasterStatus','getSecureMasterStatusDemo','finalRoute','requiresUserApproval']){if(!text.includes(token)){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token)}}if(ok)console.log('[OK] secure status privacy shape verify passed');process.exit(ok?0:1);`;
write('scripts/v-fix-secure-status-privacy-shape.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixsecurestatusprivacy:verify'] = 'node scripts/v-fix-secure-status-privacy-shape.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixsecurestatusprivacy:verify');
console.log('[OK] secure status privacy shape fix applied');
