const fs = require('fs');
const required = [
  'README_PHASE96_3.md',
  'frontend/app/p96-0/page.tsx',
  'frontend/app/api/p96-0/route.ts',
  'frontend/app/p96-1/page.tsx',
  'frontend/app/api/p96-1/route.ts',
  'frontend/app/p96-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 96 final check OK.');
