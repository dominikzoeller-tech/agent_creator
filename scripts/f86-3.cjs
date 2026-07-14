const fs = require('fs');
const required = [
  'README_PHASE86_3.md',
  'frontend/app/p86-0/page.tsx',
  'frontend/app/api/p86-0/route.ts',
  'frontend/app/p86-1/page.tsx',
  'frontend/app/api/p86-1/route.ts',
  'frontend/app/p86-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 86 final check OK.');
