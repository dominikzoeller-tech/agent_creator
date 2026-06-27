const fs = require('fs');
const path = require('path');

const target = path.join(process.cwd(), 'council-engine.ts');

if (!fs.existsSync(target)) {
  console.error('council-engine.ts wurde im Projekt-Root nicht gefunden.');
  process.exit(1);
}

const content = fs.readFileSync(target, 'utf8');
const lines = content.split(/\r?\n/);

const ranges = [
  { label: 'Interfaces / Types Anfang', start: 1, end: 60 },
  { label: 'validateCouncilResult Umgebung', start: 550, end: 610 },
  { label: 'runCouncil Umgebung', start: 610, end: 725 },
  { label: 'handleUserMessage Umgebung', start: 760, end: 840 },
];

console.log('======================================');
console.log(' Phase 6.6 Council Engine Snippet Extractor');
console.log('======================================');
console.log('');

for (const range of ranges) {
  console.log(`\n===== ${range.label} (${range.start}-${range.end}) =====`);
  for (let i = range.start; i <= range.end && i <= lines.length; i++) {
    const line = lines[i - 1] ?? '';
    console.log(`${String(i).padStart(4, ' ')}: ${line}`);
  }
}

console.log('');
console.log('Bitte diese Ausgabe kopieren und in den Chat schicken.');
console.log('Danach kann Phase 6.6 gezielt und sicher council-engine.ts patchen.');
