const fs = require('fs');
const path = require('path');
const root = process.cwd();
const targets = [
  'frontend/lib/cmt-privacy-decision.ts',
  'frontend/app/lib/cmt-privacy-decision.ts',
];

let changed = 0;
for (const rel of targets) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error('[missing]', rel);
    process.exit(1);
  }
  let text = fs.readFileSync(full, 'utf8');
  const before = text;

  text = text.replace(
    "mode: PrivacyDecisionOption;",
    "mode: PrivacyDecisionOption | 'blocked' | 'cancelled';"
  );

  text = text.replace(
    "return { accepted: false, mode: option, message: 'Vorgang wurde abgebrochen.', nextAction: 'Keine externe Weitergabe ausfuehren.' };",
    "return { accepted: false, mode: 'cancelled', message: 'Vorgang wurde abgebrochen.', nextAction: 'Keine externe Weitergabe ausfuehren.' };"
  );

  text = text.replace(
    "return { accepted: true, mode: option, message: 'Anonymisierung ist erforderlich. Externe Weitergabe bleibt bis zur Freigabe blockiert.', nextAction: 'Anonymisierte Vorschau pruefen.' };",
    "return { accepted: true, mode: detected.hasSensitiveData ? 'blocked' : option, message: 'Anonymisierung ist erforderlich. Externe Weitergabe bleibt bis zur Freigabe blockiert.', nextAction: 'Anonymisierte Vorschau pruefen.' };"
  );

  text = text.replace(
    "mode: option,\n    message: detected.hasSensitiveData ? 'Sensible Daten erkannt. Externe Weitergabe bleibt blockiert.' : 'Freigabe angefordert. Kompatibilitaetsmodus fuehrt keinen externen Call aus.',",
    "mode: detected.hasSensitiveData ? 'blocked' : option,\n    message: detected.hasSensitiveData ? 'Sensible Daten erkannt. Externe Weitergabe bleibt blockiert.' : 'Freigabe angefordert. Kompatibilitaetsmodus fuehrt keinen externen Call aus.',"
  );

  if (text !== before) {
    fs.writeFileSync(full, text, 'utf8');
    console.log('[fix]', rel);
    changed++;
  } else {
    console.log('[ok/no-change]', rel);
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ${JSON.stringify(targets)}){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');for(const token of ["mode: PrivacyDecisionOption | 'blocked' | 'cancelled'","mode: 'cancelled'","detected.hasSensitiveData ? 'blocked' : option",'providerDispatchAllowed: false','networkCallAllowed: false','finalDispatchBlocked: true']){if(!text.includes(token)){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token)}}if(ok)console.log('[OK] privacy decision outcome legacy modes verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-privacy-decision-outcome-legacy-modes.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixprivacyoutcomemodes:verify'] = 'node scripts/v-fix-privacy-decision-outcome-legacy-modes.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixprivacyoutcomemodes:verify');
console.log('[OK] privacy decision outcome legacy modes fix applied, changed=' + changed);
