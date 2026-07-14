const fs = require('fs');
const required = [
  'README_PHASE84_3.md',
  'frontend/app/p84-0/page.tsx',
  'frontend/app/api/p84-0/route.ts',
  'frontend/app/p84-1/page.tsx',
  'frontend/app/api/p84-1/route.ts',
  'frontend/app/p84-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 84 final check OK.');
