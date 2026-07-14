const fs = require('fs');
const required = [
  'README_PHASE83_3.md',
  'frontend/app/p83-0/page.tsx',
  'frontend/app/api/p83-0/route.ts',
  'frontend/app/p83-1/page.tsx',
  'frontend/app/api/p83-1/route.ts',
  'frontend/app/p83-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 83 final check OK.');
