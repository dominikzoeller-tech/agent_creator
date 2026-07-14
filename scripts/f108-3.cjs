const fs = require('fs');
const file = 'README_PHASE108_3.md';
if (!fs.existsSync(file)) throw new Error('Missing ' + file);
const text = fs.readFileSync(file, 'utf8');
const required = [
  'Phase 108.3 Final Handoff',
  'Safety invariants',
  'provider = none',
  'networkCallAllowed = false',
  'providerDispatchAllowed = false',
  'Continue with Phase 109.0'
];
for (const item of required) {
  if (!text.includes(item)) throw new Error('Missing final handoff item: ' + item);
  console.log('OK final', item);
}
console.log('Phase 108.3 final check OK.');
