const fs = require('fs');
const required = [
  'README_PHASE93_3.md',
  'frontend/app/p93-0/page.tsx',
  'frontend/app/api/p93-0/route.ts',
  'frontend/app/p93-1/page.tsx',
  'frontend/app/api/p93-1/route.ts',
  'frontend/app/p93-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 93 final check OK.');
