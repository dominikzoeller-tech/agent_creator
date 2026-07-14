const fs = require('fs');
const required = [
  'README_PHASE92_3.md',
  'frontend/app/p92-0/page.tsx',
  'frontend/app/api/p92-0/route.ts',
  'frontend/app/p92-1/page.tsx',
  'frontend/app/api/p92-1/route.ts',
  'frontend/app/p92-2-dash/page.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 92 final check OK.');
