const fs = require('fs');
const required = [
  'README_PHASE85_3.md',
  'frontend/app/p85-0/page.tsx',
  'frontend/app/api/p85-0/route.ts',
  'frontend/app/p85-1/page.tsx',
  'frontend/app/api/p85-1/route.ts',
  'frontend/app/p85-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 85 final check OK.');
