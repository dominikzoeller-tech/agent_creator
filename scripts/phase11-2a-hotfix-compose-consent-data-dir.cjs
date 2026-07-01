const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function read(file){ return fs.readFileSync(full(file), "utf8"); }
function write(file, content){ fs.writeFileSync(full(file), content, "utf8"); }
function patchPackage(){
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  // Root hatte bisher kein build-Script. Für die Phase-Checks bauen wir das Frontend und prüfen API-TypeScript ohne Emit.
  if (!pkg.scripts.build) {
    pkg.scripts.build = "npm --prefix frontend run build && npx tsc --noEmit --project tsconfig.json";
    console.log("OK package.json: build Script ergänzt.");
  } else {
    console.log("SKIP package.json: build Script existiert bereits.");
  }
  pkg.scripts["phase11:2a:hotfix"] = "node scripts/phase11-2a-hotfix-compose-consent-data-dir.cjs";
  pkg.scripts["phase11:2a:verify"] = "node scripts/phase11-2a-verify-compose-consent-data-dir.cjs";
  write(file, JSON.stringify(pkg, null, 2) + "\n");
}
function dedupeLines(lines, exactLine){
  let seen = false;
  return lines.filter((line) => {
    if (line === exactLine) {
      if (seen) return false;
      seen = true;
    }
    return true;
  });
}
function patchCompose(){
  const file = "docker-compose.internal.yml";
  let lines = read(file).split(/\r?\n/);
  // Entferne alle vorhandenen TOOL_CONSENT_DATA_DIR Zeilen. Der 11.2 Patch konnte eine davon versehentlich unter services.frontend.build setzen.
  lines = lines.filter((line) => !/^\s+TOOL_CONSENT_DATA_DIR:\s*\/data\s*$/.test(line));
  // Entferne doppelte data volume Zeilen, wir setzen sie gleich sauber neu.
  lines = lines.filter((line) => !/^\s+- \.\/data:\/data\s*$/.test(line));
  const out = [];
  let service = null;
  let inEnvironment = false;
  let inVolumes = false;
  let apiEnvAdded = false;
  let frontendEnvAdded = false;
  let apiVolumeAdded = false;
  let frontendVolumeAdded = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s{2}api:\s*$/.test(line)) { service = "api"; inEnvironment = false; inVolumes = false; }
    else if (/^\s{2}frontend:\s*$/.test(line)) { service = "frontend"; inEnvironment = false; inVolumes = false; }
    else if (/^\s{2}\S/.test(line)) { service = null; inEnvironment = false; inVolumes = false; }
    if (/^\s{4}environment:\s*$/.test(line)) { inEnvironment = true; inVolumes = false; }
    else if (/^\s{4}volumes:\s*$/.test(line)) { inVolumes = true; inEnvironment = false; }
    else if (/^\s{4}\S/.test(line) && !/^\s{4}(environment|volumes):\s*$/.test(line)) { inEnvironment = false; inVolumes = false; }
    out.push(line);
    if (service === "api" && inEnvironment && /^\s{6}PORT:\s*7071\s*$/.test(line) && !apiEnvAdded) {
      out.push("      TOOL_CONSENT_DATA_DIR: /data");
      apiEnvAdded = true;
    }
    if (service === "frontend" && inEnvironment && /^\s{6}NEXT_PUBLIC_AGENT_API_BASE_URL:/.test(line) && !frontendEnvAdded) {
      out.push("      TOOL_CONSENT_DATA_DIR: /data");
      frontendEnvAdded = true;
    }
    if (service === "api" && inVolumes && /^\s{6}- \.\/knowledge:\/app\/knowledge:ro\s*$/.test(line) && !apiVolumeAdded) {
      out.push("      - ./data:/data");
      apiVolumeAdded = true;
    }
    if (service === "frontend" && inVolumes && /^\s{6}- \.\/memory:\/memory\s*$/.test(line) && !frontendVolumeAdded) {
      out.push("      - ./data:/data");
      frontendVolumeAdded = true;
    }
  }
  let content = out.join("\n");
  // Falls Marker nicht gefunden wurden, abbrechen statt Compose unsicher zu schreiben.
  const required = [
    [apiEnvAdded, "api environment PORT Marker"],
    [frontendEnvAdded, "frontend environment NEXT_PUBLIC_AGENT_API_BASE_URL Marker"],
    [apiVolumeAdded, "api volumes knowledge Marker"],
    [frontendVolumeAdded, "frontend volumes memory Marker"],
  ];
  const missing = required.filter(([ok]) => !ok).map(([, name]) => name);
  if (missing.length > 0) {
    throw new Error("docker-compose.internal.yml konnte nicht sicher gepatcht werden. Fehlende Marker: " + missing.join(", "));
  }
  write(file, content.endsWith("\n") ? content : content + "\n");
  console.log("OK docker-compose.internal.yml: TOOL_CONSENT_DATA_DIR aus build entfernt und sauber unter environment gesetzt.");
}
patchPackage();
patchCompose();
console.log("Phase 11.2a Hotfix abgeschlossen.");
