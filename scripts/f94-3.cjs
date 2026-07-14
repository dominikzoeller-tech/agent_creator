const fs = require('fs');
const required = [
  'README_PHASE94_3.md',
  'frontend/app/p94-0/page.tsx',
  'frontend/app/api/p94-0/route.ts',
  'frontend/app/p94-1/page.tsx',
  'frontend/app/api/p94-1/route.ts',
  'frontend/app/p94-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 94 final check OK.');
