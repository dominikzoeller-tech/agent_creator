const fs = require('fs');
const required = [
  'README_PHASE88_3.md',
  'frontend/app/p88-0/page.tsx',
  'frontend/app/api/p88-0/route.ts',
  'frontend/app/p88-1/page.tsx',
  'frontend/app/api/p88-1/route.ts',
  'frontend/app/p88-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 88 final check OK.');
