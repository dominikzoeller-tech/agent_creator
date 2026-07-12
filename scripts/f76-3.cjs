const fs = require('fs');
const path = require('path');
const text = fs.readFileSync(path.join(process.cwd(), 'README_PHASE76_3.md'), 'utf8');
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
  if (!text.includes(item)) throw new Error('Final check failed, missing: ' + item);
  console.log('OK fragment', item);
}
console.log('Phase 76.3 final check OK.');
