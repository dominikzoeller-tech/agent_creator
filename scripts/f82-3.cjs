const fs = require('fs');
const required = ['README_PHASE82_3.md', 'frontend/app/p82-2-dash/page.tsx'];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);
}
console.log('Phase 82 final check OK.');
