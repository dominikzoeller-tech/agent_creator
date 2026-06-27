const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'agent-capabilities.ts',
  'agent-capabilities-smoke-test.ts',
  'agent-routing-details.ts',
  'agent-routing-smoke-test.ts',
  'council-routing-metadata.ts',
  'council-routing-metadata-smoke-test.ts',
  'council-engine.ts',
  'package.json',
];

function exists(file) {
  return fs.existsSync(path.join(process.cwd(), file));
}

console.log('======================================');
console.log(' Phase 6.4 Council Integration Preflight');
console.log('======================================');
console.log('');

let ok = true;
for (const file of requiredFiles) {
  const found = exists(file);
  console.log(`${found ? 'OK ' : 'MISS'} ${file}`);
  if (!found) ok = false;
}

console.log('');

if (!exists('package.json')) {
  console.error('package.json fehlt. Bitte im Projekt-Root ausführen.');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
const scripts = pkg.scripts || {};
const expectedScripts = [
  'agent:capabilities:test',
  'agent:routing:test',
  'council:routing:metadata:test',
];

console.log('Scripts:');
for (const script of expectedScripts) {
  const found = Boolean(scripts[script]);
  console.log(`${found ? 'OK ' : 'MISS'} ${script}`);
  if (!found) ok = false;
}

console.log('');

if (exists('council-engine.ts')) {
  const content = fs.readFileSync(path.join(process.cwd(), 'council-engine.ts'), 'utf8');
  console.log('Council Engine Hinweise:');
  console.log(`- Länge: ${content.length} Zeichen`);
  console.log(`- Enthält route direct/council: ${content.includes('direct') && content.includes('council') ? 'ja' : 'unklar'}`);
  console.log(`- Import buildCouncilRoutingMetadata schon vorhanden: ${content.includes('buildCouncilRoutingMetadata') ? 'ja' : 'nein'}`);
}

console.log('');

if (!ok) {
  console.error('Preflight NICHT vollständig. Bitte fehlende Dateien/Scripts zuerst ergänzen.');
  process.exit(1);
}

console.log('Preflight OK. Phase 6.5 kann die Integration in council-engine.ts vorbereiten.');
