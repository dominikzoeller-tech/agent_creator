const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'council-engine.ts');

console.log('======================================');
console.log(' Phase 6.5 Council Engine Inspector');
console.log('======================================');
console.log('');

if (!fs.existsSync(filePath)) {
  console.error('MISS council-engine.ts wurde im Projekt-Root nicht gefunden.');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

const checks = [
  ['Hat buildCouncilRoutingMetadata Import', content.includes('buildCouncilRoutingMetadata')],
  ['Hat attachCouncilRoutingMetadata Import', content.includes('attachCouncilRoutingMetadata')],
  ['Hat direct Route Text', content.includes('direct')],
  ['Hat council Route Text', content.includes('council')],
  ['Hat recommendation Feld', content.includes('recommendation')],
  ['Hat firstStep Feld', content.includes('firstStep')],
  ['Hat confidence Feld', content.includes('confidence')],
  ['Hat usedCouncil Feld', content.includes('usedCouncil')],
];

for (const [label, ok] of checks) {
  console.log(`${ok ? 'OK  ' : 'INFO'} ${label}: ${ok ? 'ja' : 'nein/unklar'}`);
}

console.log('');
console.log('Mögliche Export-/Funktionszeilen:');
lines.forEach((line, index) => {
  if (/export\s+(async\s+)?function|export\s+const|async\s+function|function\s+/.test(line)) {
    console.log(`${String(index + 1).padStart(4, ' ')}: ${line.trim()}`);
  }
});

console.log('');
console.log('Mögliche Return-Objekte / JSON-Strukturen:');
lines.forEach((line, index) => {
  if (/return\s+\{|route:|recommendation:|firstStep:|confidence:|usedCouncil:/.test(line)) {
    console.log(`${String(index + 1).padStart(4, ' ')}: ${line.trim()}`);
  }
});

console.log('');
console.log('Empfohlener nächster Schritt:');
console.log('1. Die obigen Funktions- und Return-Zeilen prüfen.');
console.log('2. Danach kann Phase 6.6 gezielt den passenden Return-Punkt patchen.');
console.log('3. Bis dahin bleibt council-engine.ts unverändert.');
