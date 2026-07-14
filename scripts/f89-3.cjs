const fs = require('fs');
const required = [
  'README_PHASE89_3.md',
  'frontend/app/p89-0/page.tsx',
  'frontend/app/api/p89-0/route.ts',
  'frontend/app/p89-1/page.tsx',
  'frontend/app/api/p89-1/route.ts',
  'frontend/app/p89-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 89 final check OK.');
