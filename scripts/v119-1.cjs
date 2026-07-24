const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-ask.ts', 'CommitteeIntent'],
  ['frontend/lib/cmt-ask.ts', 'detectIntent'],
  ['frontend/lib/cmt-ask.ts', "phase: '119.1'"],
  ['frontend/lib/cmt-ask.ts', "label: 'Gremium Ask MVP Plus'"],
  ['frontend/lib/cmt-ask.ts', "usableStatus: 'local-testable-plus'"],
  ['frontend/lib/cmt-ask.ts', 'Visionär'],
  ['frontend/lib/cmt-ask.ts', 'Skeptiker'],
  ['frontend/lib/cmt-ask.ts', 'Datenschutz & Risiko'],
  ['frontend/lib/cmt-ask.ts', 'internetAccessEnabled: false'],
  ['frontend/lib/cmt-ask.ts', 'liveModelEnabled: false'],
  ['frontend/app/api/cmt/ask/route.ts', 'askCommitteeLocal'],
  ['frontend/app/cmt/ask/page.tsx', '5er-Gremium'],
  ['frontend/app/cmt/ask/page.tsx', 'Erkannter Typ'],
  ['README_PHASE119_1.md', 'Gremium Ask MVP Plus'],
  ['package.json', 'phase119:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 119.1 Gremium Ask MVP Plus verification OK.');
