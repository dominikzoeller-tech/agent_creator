const fs = require('fs');
const required = [
  'README_PHASE87_3.md',
  'frontend/app/p87-0/page.tsx',
  'frontend/app/api/p87-0/route.ts',
  'frontend/app/p87-1/page.tsx',
  'frontend/app/api/p87-1/route.ts',
  'frontend/app/p87-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 87 final check OK.');
