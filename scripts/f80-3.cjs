const fs = require('fs');
const path = require('path');
const text = fs.readFileSync(path.join(process.cwd(), 'README_PHASE80_3.md'), 'utf8');
const required = [
  'provider=none',
  'modelSelected=none',
  'dryRunOnly=true',
  'finalDispatchBlocked=true',
  'executionGateClosed=true',
  'networkCallAllowed=false',
  'providerDispatchAllowed=false',
  'promptPayloadPresent=false',
  'secretsPresent=false',
  'providerResponsePresent=false'
];
for (const item of required) {
  if (!text.includes(item)) throw new Error('Missing final handoff invariant: ' + item);
  console.log('OK fragment', item);
}
console.log('Phase 80.3 final check OK.');
