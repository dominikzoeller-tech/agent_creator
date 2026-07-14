const fs = require('fs');
const required = [
  'README_PHASE95_3.md',
  'frontend/app/p95-0/page.tsx',
  'frontend/app/api/p95-0/route.ts',
  'frontend/app/p95-1/page.tsx',
  'frontend/app/api/p95-1/route.ts',
  'frontend/app/p95-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 95 final check OK.');
