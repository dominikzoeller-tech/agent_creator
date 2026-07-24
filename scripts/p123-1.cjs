const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('WROTE', rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + '\n', 'utf8');

write('frontend/lib/cmt-master-nav-status.ts', `import { getSecureMasterHome, type SecureMasterHome } from './cmt-master-home';

export type SecureMasterNavStatus = {
  phase: '123.1';
  label: 'Secure Master Navigation Status';
  home: SecureMasterHome;
  navigationState: {
    primaryEntryVisible: true;
    primaryEntry: '/cmt/master/secure';
    homeEntry: '/cmt/master/home';
    statusEntry: '/cmt/master/secure/status';
    guideEntry: '/cmt/master/secure/guide';
    recommendedDefaultPage: '/cmt/master/secure';
    message: string;
  };
  routeMap: {
    secureMaster: '/cmt/master/secure';
    secureMasterHome: '/cmt/master/home';
    secureMasterStatus: '/cmt/master/secure/status';
    secureMasterGuide: '/cmt/master/secure/guide';
    privacyGate: '/cmt/privacy';
    privacyDecision: '/cmt/privacy/decision';
    committeeAsk: '/cmt/ask';
  };
  safety: {
    localTestable: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterNavStatus(): SecureMasterNavStatus {
  return {
    phase: '123.1',
    label: 'Secure Master Navigation Status',
    home: getSecureMasterHome(),
    navigationState: {
      primaryEntryVisible: true,
      primaryEntry: '/cmt/master/secure',
      homeEntry: '/cmt/master/home',
      statusEntry: '/cmt/master/secure/status',
      guideEntry: '/cmt/master/secure/guide',
      recommendedDefaultPage: '/cmt/master/secure',
      message: 'Der Secure Master Agent ist der zentrale lokale Einstieg. Noch nicht live mit KI-Modell.',
    },
    routeMap: {
      secureMaster: '/cmt/master/secure',
      secureMasterHome: '/cmt/master/home',
      secureMasterStatus: '/cmt/master/secure/status',
      secureMasterGuide: '/cmt/master/secure/guide',
      privacyGate: '/cmt/privacy',
      privacyDecision: '/cmt/privacy/decision',
      committeeAsk: '/cmt/ask',
    },
    safety: {
      localTestable: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 123.2: Secure Master als App-Entry verlinken',
  };
}
`);

write('frontend/app/api/cmt/master/nav/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterNavStatus } from '../../../../../lib/cmt-master-nav-status';

export async function GET() {
  return NextResponse.json(getSecureMasterNavStatus());
}
`);

write('frontend/app/cmt/master/nav/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterNavStatus } from '../../../../lib/cmt-master-nav-status';

export default function SecureMasterNavStatusPage() {
  const status = getSecureMasterNavStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 123.1</h1>
        <h2>{status.label}</h2>
        <p>{status.navigationState.message}</p>
        <p><strong>Empfohlene Startseite:</strong> <Link href={status.navigationState.recommendedDefaultPage}>{status.navigationState.recommendedDefaultPage}</Link></p>
      </section>

      <section style={card}>
        <h3>Navigation State</h3>
        <ul>
          <li>primaryEntryVisible: {String(status.navigationState.primaryEntryVisible)}</li>
          <li>primaryEntry: {status.navigationState.primaryEntry}</li>
          <li>homeEntry: {status.navigationState.homeEntry}</li>
          <li>statusEntry: {status.navigationState.statusEntry}</li>
          <li>guideEntry: {status.navigationState.guideEntry}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Route Map</h3>
        <ul>
          {Object.entries(status.routeMap).map(([key, value]) => <li key={key}><Link href={value}>{key}: {value}</Link></li>)}
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety</h3>
        <ul>
          <li>localTestable: {String(status.safety.localTestable)}</li>
          <li>liveModelEnabled: {String(status.safety.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.safety.providerEnabled)}</li>
          <li>internetEnabled: {String(status.safety.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.safety.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {status.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE123_1.md', `# Phase 123.1 - Secure Master Navigation Status

Baut eine Statusseite fuer die Secure-Master-Navigation.

Kurz-Namen:

- Store: frontend/lib/cmt-master-nav-status.ts
- API: /api/cmt/master/nav/status
- UI: /cmt/master/nav/status
- Patch: scripts/p123-1.cjs
- Verify: scripts/v123-1.cjs

Wichtigster lokaler Einstieg:

- /cmt/master/secure

Status:

- lokal testbar
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v123-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-nav-status.ts', 'getSecureMasterNavStatus'],
  ['frontend/lib/cmt-master-nav-status.ts', "phase: '123.1'"],
  ['frontend/lib/cmt-master-nav-status.ts', "primaryEntry: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-nav-status.ts', "recommendedDefaultPage: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-nav-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/nav/status/route.ts', 'getSecureMasterNavStatus'],
  ['frontend/app/cmt/master/nav/status/page.tsx', 'Navigation State'],
  ['frontend/app/cmt/master/nav/status/page.tsx', 'Route Map'],
  ['README_PHASE123_1.md', 'Secure Master Navigation Status'],
  ['package.json', 'phase123:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 123.1 Secure Master Navigation Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase123:1:verify'] = 'node scripts/v123-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 123.1 Secure Master Navigation Status patch applied.');
