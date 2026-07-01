const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return fs.readFileSync(full(file), "utf8"); }
function write(file, content){ fs.writeFileSync(full(file), content, "utf8"); }
function ensureImport(content, importLine){
  if(content.includes(importLine)) return content;
  const lines = content.split(/\r?\n/);
  let lastImport = -1;
  for(let i=0;i<lines.length;i++) if(lines[i].startsWith("import ")) lastImport = i;
  if(lastImport >= 0){ lines.splice(lastImport + 1, 0, importLine); return lines.join("\n"); }
  return importLine + "\n" + content;
}
function patchToolConsentPage(){
  const file = "frontend/app/tool-consent/page.tsx";
  if(!exists(file)) throw new Error(file + " nicht gefunden.");
  let content = read(file);
  const original = content;
  const importLine = 'import { UnifiedNavigation } from "../../components/UnifiedNavigation";';
  content = ensureImport(content, importLine);
  // Entferne alte inline Navigationen mit style={{...}}, falls vorhanden.
  content = content.replace(/<nav\s+style=\{\{[\s\S]*?\}\}>[\s\S]*?<\/nav>\s*/g, "");
  if(!content.includes('<UnifiedNavigation active="tool-consent" />')){
    const mainRegex = /<main className="page-wrap">\s*/;
    if(mainRegex.test(content)){
      content = content.replace(mainRegex, '<main className="page-wrap">\n      <UnifiedNavigation active="tool-consent" />\n      ');
    } else {
      throw new Error("Konnte <main className=\"page-wrap\"> in frontend/app/tool-consent/page.tsx nicht finden.");
    }
  }
  if(content !== original){ write(file, content); console.log("OK frontend/app/tool-consent/page.tsx: UnifiedNavigation active=tool-consent ergänzt."); }
  else console.log("SKIP frontend/app/tool-consent/page.tsx: bereits korrekt.");
}
function patchDocs(){
  const file = "phase11-7-registry-ui-polish-unified-navigation.md";
  if(!exists(file)) throw new Error(file + " nicht gefunden.");
  let content = read(file);
  const additions = [];
  if(!content.includes("UnifiedNavigation")) additions.push("Verify-Hinweis: Die zentrale Komponente heißt UnifiedNavigation.");
  if(!content.includes("data/")) additions.push("Verify-Hinweis: data/ wird als Runtime Store ignoriert.");
  if(additions.length){
    content += "\n" + additions.join("\n") + "\n";
    write(file, content);
    console.log("OK " + file + ": Verify-Hinweise ergänzt.");
  } else console.log("SKIP " + file + ": Verify-Hinweise bereits vorhanden.");
}
function patchPackage(){
  const file = "package.json";
  if(!exists(file)) return;
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["phase11:7a:hotfix"] = "node scripts/phase11-7a-hotfix-unified-navigation-verify.cjs";
  pkg.scripts["phase11:7a:verify"] = "node scripts/phase11-7a-verify-unified-navigation-verify.cjs";
  write(file, JSON.stringify(pkg, null, 2) + "\n");
  console.log("OK package.json: Phase 11.7a Scripts eingetragen.");
}
patchToolConsentPage();
patchDocs();
patchPackage();
console.log("Phase 11.7a Hotfix abgeschlossen.");
