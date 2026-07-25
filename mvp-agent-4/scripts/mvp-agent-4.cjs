const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const libPath = path.join(root, 'frontend/lib/cmt-secure-master-agent-mvp.ts');
if (!fs.existsSync(libPath)) {
  console.error('[missing] frontend/lib/cmt-secure-master-agent-mvp.ts');
  process.exit(1);
}
let lib = fs.readFileSync(libPath, 'utf8');

if (!lib.includes("priority: 'low' | 'medium' | 'high' | 'critical'")) {
  lib = lib.replace("confidence: 'low' | 'medium' | 'high';", "confidence: 'low' | 'medium' | 'high';\n  priority: 'low' | 'medium' | 'high' | 'critical';\n  liveReadiness: 'not_ready' | 'prepare_gate' | 'blocked_by_privacy' | 'tool_required_first';");
}

if (!lib.includes('function priority(')) {
  lib = lib.replace(
    "function label(route: AgentRoute) {",
    "function priority(intent: AgentIntent, route: AgentRoute, privacy: PrivacyDecision): 'low' | 'medium' | 'high' | 'critical' {\n  if (privacy === 'block_external') return 'critical';\n  if (route === 'privacy_gate') return 'high';\n  if (intent === 'live_switch') return 'high';\n  if (route === 'agent_builder') return 'medium';\n  if (route === 'tool_required') return 'medium';\n  return 'medium';\n}\n\nfunction liveReadiness(route: AgentRoute, privacy: PrivacyDecision): 'not_ready' | 'prepare_gate' | 'blocked_by_privacy' | 'tool_required_first' {\n  if (privacy === 'block_external' || route === 'privacy_gate') return 'blocked_by_privacy';\n  if (route === 'tool_required') return 'tool_required_first';\n  return 'prepare_gate';\n}\n\nfunction label(route: AgentRoute) {"
  );
}

if (!lib.includes('Live-Readiness')) {
  lib = lib.replace(
    "return 'Erkannt: Intent=' + intent + ', Route=' + route + ', Privacy=' + privacy + '. Entscheidung erfolgt lokal ohne Provider und ohne Internet.';",
    "return 'Erkannt: Intent=' + intent + ', Route=' + route + ', Privacy=' + privacy + '. Entscheidung erfolgt lokal ohne Provider und ohne Internet. Live-Readiness wird nur vorbereitet, nicht aktiviert.';"
  );
}

if (!lib.includes('priority: priority(intent, route, privacyDecision)')) {
  lib = lib.replace(
    "confidence: confidence(intent),\n    modeLabel: label(route),",
    "confidence: confidence(intent),\n    priority: priority(intent, route, privacyDecision),\n    liveReadiness: liveReadiness(route, privacyDecision),\n    modeLabel: label(route),"
  );
}

write('frontend/lib/cmt-secure-master-agent-mvp.ts', lib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('Priorität:')) {
  page = page.replace(
    "<span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Confidence: {current.confidence ?? 'medium'}</span>",
    "<span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Confidence: {current.confidence ?? 'medium'}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Priorität: {current.priority ?? 'medium'}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Live-Readiness: {current.liveReadiness ?? 'prepare_gate'}</span>"
  );
}

if (!page.includes('Live-Schaltung bleibt gesperrt')) {
  page = page.replace(
    "<h2>Safety State</h2>",
    "<h2>Safety State</h2>\n            <p style={{ color: '#94a3b8', fontSize: 13 }}>Live-Schaltung bleibt gesperrt, bis Provider-Gate, Datenschutzfreigabe und Build stabil sind.</p>"
  );
}

if (!page.includes('Nächste Haupt-Entscheidung')) {
  page = page.replace(
    "<h3>Nächste Schritte</h3>",
    "<h3>Nächste Haupt-Entscheidung</h3>\n            <p style={{ color: '#cbd5e1' }}>Aktuell: lokal testen, Antwortqualität verbessern, Build stabil halten. Live-KI kommt erst nach explizitem Provider-Gate.</p>\n            <h3>Nächste Schritte</h3>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;const lib=fs.readFileSync(path.join(root,'frontend/lib/cmt-secure-master-agent-mvp.ts'),'utf8');const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['priority','liveReadiness','Live-Readiness','blocked_by_privacy']){if(!lib.includes(token)){console.error('[missing lib token]',token);ok=false}else console.log('[ok lib]',token)}for(const token of ['Priorität','Live-Readiness','Live-Schaltung bleibt gesperrt','Nächste Haupt-Entscheidung']){if(!page.includes(token)){console.error('[missing page token]',token);ok=false}else console.log('[ok page]',token)}if(ok)console.log('[OK] mvp-agent-4 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-4.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp4:verify'] = 'node scripts/v-mvp-agent-4.cjs';
pkg.scripts['agent:mvp4:verify'] = 'node scripts/v-mvp-agent-4.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp4:verify agent:mvp4:verify');
console.log('[OK] mvp-agent-4 applied');
