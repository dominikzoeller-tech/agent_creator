const fs = require('fs');
const required = [
  'README_PHASE90_3.md',
  'frontend/app/p90-0/page.tsx',
  'frontend/app/api/p90-0/route.ts',
  'frontend/app/p90-1/page.tsx',
  'frontend/app/api/p90-1/route.ts',
  'frontend/app/p90-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 90 final check OK.');
