const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('package.json wurde im aktuellen Ordner nicht gefunden. Bitte im Projekt-Root ausführen.');
  process.exit(1);
}

const raw = fs.readFileSync(packageJsonPath, 'utf8');
const pkg = JSON.parse(raw);

pkg.scripts = pkg.scripts || {};

const stackScripts = {
  'stack:up': 'docker compose -f docker-compose.internal.yml up --build',
  'stack:up:detached': 'docker compose -f docker-compose.internal.yml up --build -d',
  'stack:down': 'docker compose -f docker-compose.internal.yml down',
  'stack:logs': 'docker compose -f docker-compose.internal.yml logs -f',
  'stack:ps': 'docker compose -f docker-compose.internal.yml ps',
  'stack:health': 'powershell -ExecutionPolicy Bypass -File scripts/stack-health-check.ps1'
};

for (const [key, value] of Object.entries(stackScripts)) {
  pkg.scripts[key] = value;
}

fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

console.log('Stack-Scripts wurden erfolgreich zu package.json hinzugefügt/aktualisiert:');
for (const key of Object.keys(stackScripts)) {
  console.log(`- ${key}`);
}
