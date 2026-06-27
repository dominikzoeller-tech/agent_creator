const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('package.json wurde im aktuellen Ordner nicht gefunden. Bitte im Projekt-Root ausführen.');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase6:council:inspect'] = 'node scripts/phase6-5-inspect-council-engine.cjs';
fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
console.log('Script phase6:council:inspect wurde zu package.json hinzugefügt/aktualisiert.');
