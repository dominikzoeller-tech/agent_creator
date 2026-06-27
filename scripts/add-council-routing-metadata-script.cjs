const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('package.json wurde im aktuellen Ordner nicht gefunden. Bitte im Projekt-Root ausführen.');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['council:routing:metadata:test'] = 'npx ts-node council-routing-metadata-smoke-test.ts';
fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
console.log('Script council:routing:metadata:test wurde zu package.json hinzugefügt/aktualisiert.');
