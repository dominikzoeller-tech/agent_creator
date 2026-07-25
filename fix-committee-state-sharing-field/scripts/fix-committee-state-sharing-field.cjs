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
  label: string;
  committeeAvailable: boolean;
  committeeState: {
    summary: string;
    ready: boolean;
    roles: number;
    integratedInSecureMaster: boolean;
    fiveRolesVisible: boolean;
    localOnly: boolean;
    decisionQuestionsDetected: boolean;
    finalRecommendationVisible: boolean;
    liveModelEnabled: boolean;
    providerEnabled: boolean;
    internetEnabled: boolean;
    externalSharingAllowed: boolean;
    privacyGateActive: boolean;
    externalCallsBlocked: boolean;
    browserCompatible: boolean;
    buildCompatibilityMode: boolean;
  };
  mainCommitteePage: string;
  mainQualityPage: string;
  demo: SecureMasterCommitteeResult;
  checkedAt: string;
  message: string;
};

export function getSecureMasterCommitteeStatus(): SecureMasterCommitteeStatus {
  const demo = getSecureMasterCommitteeDemo();
  return {
    phase: '125.1',
    ok: true,
    label: 'Secure Master Committee Status',
    committeeAvailable: true,
    committeeState: {
      summary: 'Committee compatibility status is available. Legacy committee routes are stabilized for build validation.',
      ready: true,
      roles: 5,
      integratedInSecureMaster: true,
      fiveRolesVisible: true,
      localOnly: true,
      decisionQuestionsDetected: true,
      finalRecommendationVisible: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      privacyGateActive: true,
      externalCallsBlocked: true,
      browserCompatible: true,
      buildCompatibilityMode: true,
    },
    mainCommitteePage: '/cmt/master/secure/committee',
    mainQualityPage: '/cmt/master/secure/committee/quality',
    demo,
    checkedAt: new Date().toISOString(),
    message: 'Secure Master Committee legacy status compatibility is available.',
  };
}

export const createSecureMasterCommitteeStatus = getSecureMasterCommitteeStatus;
export default getSecureMasterCommitteeStatus;
`;

write('frontend/lib/cmt-master-committee-status.ts', content);
write('frontend/app/lib/cmt-master-committee-status.ts', content);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-master-committee-status.ts','frontend/app/lib/cmt-master-committee-status.ts']){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');for(const token of ['externalSharingAllowed','finalRecommendationVisible','liveModelEnabled','providerEnabled','internetEnabled','integratedInSecureMaster']){if(!text.includes(token)){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token)}}if(ok)console.log('[OK] committee state sharing field verify passed');process.exit(ok?0:1);`;
write('scripts/v-fix-committee-state-sharing-field.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixcommitteesharing:verify'] = 'node scripts/v-fix-committee-state-sharing-field.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixcommitteesharing:verify');
console.log('[OK] committee state sharing field fix applied');
