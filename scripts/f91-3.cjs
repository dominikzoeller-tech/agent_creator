const fs = require('fs');
const required = [
  'README_PHASE91_3.md',
  'frontend/app/p91-0/page.tsx',
  'frontend/app/api/p91-0/route.ts',
  'frontend/app/p91-1/page.tsx',
  'frontend/app/api/p91-1/route.ts',
  'frontend/app/p91-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 91 final check OK.');
