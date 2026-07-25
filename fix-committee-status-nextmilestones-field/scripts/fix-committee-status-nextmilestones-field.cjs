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
  roles: string[];
  testPrompts: string[];
  nextMilestones: string[];
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

const defaultRoles = [
  'Vorsitz / Synthese',
  'Datenschutz / Privacy',
  'Technik / Architektur',
  'Risiko / Sicherheit',
  'Qualitaet / Entscheidung',
];

const defaultTestPrompts = [
  'Soll diese Antwort lokal bleiben?',
  'Welche Risiken sieht das Gremium?',
  'Welche Empfehlung ergibt sich aus Datenschutz, Technik und Qualitaet?',
  'Welche Informationen muessen anonymisiert werden?',
  'Was ist der naechste sichere Schritt?',
];

const defaultNextMilestones = [
  'Build gruen bekommen',
  'Worker-Ergebnis laden',
  'Legacy-CMT-Routen konsolidieren',
  'Echte Implementierungen nach und nach aus Stubs herausloesen',
  'Provider-/Live-Funktionen nur nach expliziter Freigabe aktivieren',
];

export function getSecureMasterCommitteeStatus(): SecureMasterCommitteeStatus {
  const demo = getSecureMasterCommitteeDemo();
  return {
    phase: '125.1',
    ok: true,
    label: 'Secure Master Committee Status',
    committeeAvailable: true,
    roles: defaultRoles,
    testPrompts: defaultTestPrompts,
    nextMilestones: defaultNextMilestones,
    committeeState: {
      summary: 'Committee compatibility status is available. Legacy committee routes are stabilized for build validation.',
      ready: true,
      roles: defaultRoles.length,
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

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-master-committee-status.ts','frontend/app/lib/cmt-master-committee-status.ts']){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');for(const token of ['nextMilestones: string[]','defaultNextMilestones','nextMilestones: defaultNextMilestones','testPrompts: string[]','roles: string[]','externalSharingAllowed']){if(!text.includes(token)){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token)}}if(ok)console.log('[OK] committee status nextMilestones field verify passed');process.exit(ok?0:1);`;
write('scripts/v-fix-committee-status-nextmilestones-field.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixcommitteemilestones:verify'] = 'node scripts/v-fix-committee-status-nextmilestones-field.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixcommitteemilestones:verify');
console.log('[OK] committee status nextMilestones field fix applied');
