#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  console.log('[f82-2] wrote ' + rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, data) => fs.writeFileSync(path.join(root, rel), JSON.stringify(data, null, 2) + '\n', 'utf8');

const smoke = "#!/usr/bin/env node\n" +
"const http = require('http');\n\n" +
"const base = process.env.PHASE82_BASE_URL || 'http://localhost:3000';\n" +
"const targets = ['/p82-2-dash', '/p82-1', '/p82-0', '/api/p82-1', '/api/p82-0'];\n\n" +
"function get(target) {\n" +
"  return new Promise((resolve) => {\n" +
"    const url = new URL(target, base);\n" +
"    const req = http.get(url, (res) => {\n" +
"      res.resume();\n" +
"      res.on('end', () => resolve({ target: target, status: res.statusCode }));\n" +
"    });\n" +
"    req.setTimeout(5000, () => {\n" +
"      req.destroy();\n" +
"      resolve({ target: target, error: 'timeout' });\n" +
"    });\n" +
"    req.on('error', (error) => resolve({ target: target, error: error.message }));\n" +
"  });\n" +
"}\n\n" +
"(async () => {\n" +
"  let failed = false;\n" +
"  for (const target of targets) {\n" +
"    const result = await get(target);\n" +
"    if (result.status && result.status >= 200 && result.status < 400) {\n" +
"      console.log('[s82-2] PASS ' + target + ' ' + result.status);\n" +
"    } else {\n" +
"      failed = true;\n" +
"      console.error('[s82-2] FAIL ' + target + ' ' + (result.status || result.error));\n" +
"    }\n" +
"  }\n" +
"  if (failed) process.exit(1);\n" +
"  console.log('[s82-2] PASS');\n" +
"})();\n";

const verify = "#!/usr/bin/env node\n" +
"const fs = require('fs');\n" +
"const path = require('path');\n" +
"const root = process.cwd();\n" +
"const required = [\n" +
"  'frontend/app/p82-2-dash/page.tsx',\n" +
"  'frontend/app/p82-1/page.tsx',\n" +
"  'frontend/app/p82-0/page.tsx',\n" +
"  'frontend/app/api/p82-1/route.ts',\n" +
"  'frontend/app/api/p82-0/route.ts',\n" +
"  'scripts/s82-2.cjs'\n" +
"];\n" +
"let failed = false;\n" +
"for (const rel of required) {\n" +
"  if (!fs.existsSync(path.join(root, rel))) {\n" +
"    console.error('[v82-2] missing ' + rel);\n" +
"    failed = true;\n" +
"  }\n" +
"}\n" +
"const dashboard = path.join(root, 'frontend/app/p82-2-dash/page.tsx');\n" +
"if (fs.existsSync(dashboard)) {\n" +
"  const content = fs.readFileSync(dashboard, 'utf8');\n" +
"  for (const token of ['Phase 82.2', 'P821_POLICY_AUDIT', 'P820_SEAL_FINAL_CLOSURE_BOUNDARY']) {\n" +
"    if (!content.includes(token)) {\n" +
"      console.error('[v82-2] dashboard token missing: ' + token);\n" +
"      failed = true;\n" +
"    }\n" +
"  }\n" +
"}\n" +
"if (failed) process.exit(1);\n" +
"console.log('[v82-2] PASS');\n";

write('scripts/s82-2.cjs', smoke);
write('scripts/v82-2.cjs', verify);

const pkgPath = path.join(root, 'package.json');
if (!fs.existsSync(pkgPath)) throw new Error('package.json not found');
const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase82:2:verify'] = 'node scripts/v82-2.cjs';
pkg.scripts['phase82:2:smoke'] = 'node scripts/s82-2.cjs';
writeJson('package.json', pkg);
console.log('[f82-2] package scripts fixed');
console.log('[f82-2] done');
