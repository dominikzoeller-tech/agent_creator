const fs = require('fs');
const path = require('path');
const root = process.cwd();
const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

// Ensure current result fields from mvp-agent-2 are visible without rewriting whole page.
if (!page.includes('Arbeitsmodus')) {
  page = page.replace(
    `<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Intent: {current.intent}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Route: {current.route}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Privacy: {current.privacyDecision}</span>\n            </div>`,
    `<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Arbeitsmodus: {current.modeLabel ?? current.route}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Confidence: {current.confidence ?? 'medium'}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Intent: {current.intent}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Route: {current.route}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Privacy: {current.privacyDecision}</span>\n            </div>`
  );
}

if (!page.includes('Warum diese Einordnung?')) {
  page = page.replace(
    `<h2>Lokale Antwort</h2>`,
    `<h2>Lokale Antwort</h2>\n            <p style={{ color: '#94a3b8', fontSize: 13 }}>Warum diese Einordnung? {current.reason ?? 'Lokale Regelentscheidung ohne Provider und ohne Internet.'}</p>`
  );
}

if (!page.includes('Dieser Bildschirm ist ab jetzt der Haupttestpunkt')) {
  page = page.replace(
    `Kein Provider, kein Internet, keine externe Weitergabe.`,
    `Kein Provider, kein Internet, keine externe Weitergabe. Dieser Bildschirm ist ab jetzt der Haupttestpunkt für den Master-Agenten.`
  );
}

fs.writeFileSync(pagePath, page, 'utf8');
console.log('[write] frontend/app/cmt/master/secure/agent/page.tsx');

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');let ok=true;for(const token of ['Arbeitsmodus','Confidence','Warum diese Einordnung','Haupttestpunkt']){if(!page.includes(token)){console.error('[missing]',token);ok=false}else console.log('[ok]',token)}process.exit(ok?0:1);`;
fs.writeFileSync(path.join(root, 'scripts/v-mvp-agent-3.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp3:verify'] = 'node scripts/v-mvp-agent-3.cjs';
pkg.scripts['agent:mvp3:verify'] = 'node scripts/v-mvp-agent-3.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp3:verify agent:mvp3:verify');
console.log('[OK] mvp-agent-3 applied');
