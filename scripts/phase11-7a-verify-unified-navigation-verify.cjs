const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!exists(file)){ console.log("MISS " + file); return false; }
  const content = read(file); let ok = true;
  for(const pattern of patterns){
    const found = content.includes(pattern);
    console.log((found ? "OK  " : "MISS") + " " + file + ": " + pattern);
    if(!found) ok = false;
  }
  return ok;
}
console.log("======================================");
console.log(" Phase 11.7a Unified Navigation Hotfix Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/tool-consent/page.tsx", ["UnifiedNavigation", '<UnifiedNavigation active="tool-consent" />']) && ok;
ok = check("phase11-7-registry-ui-polish-unified-navigation.md", ["UnifiedNavigation", "data/"]) && ok;
ok = check("package.json", ["phase11:7a:hotfix", "phase11:7a:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 11.7a Hotfix ist vorbereitet.");
