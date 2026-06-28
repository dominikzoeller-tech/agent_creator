const fs = require("fs");
const path = require("path");

function read(file) { return fs.readFileSync(path.join(process.cwd(), file), "utf8"); }
function write(file, content) { fs.writeFileSync(path.join(process.cwd(), file), content, "utf8"); }

function patchCompose() {
  const file = "docker-compose.internal.yml";
  let content = read(file);
  const original = content;

  function ensureVolume(serviceName, line) {
    const serviceRegex = new RegExp(`(  ${serviceName}:\\n[\\s\\S]*?)(?=\\n  [a-zA-Z0-9_-]+:|\\n?$)`, "m");
    const match = content.match(serviceRegex);
    if (!match) throw new Error(`Service ${serviceName} nicht gefunden.`);
    let block = match[1];
    if (block.includes(line)) return;
    if (block.includes("\n    volumes:\n")) {
      block = block.replace("\n    volumes:\n", `\n    volumes:\n      - ${line}\n`);
    } else {
      const portsIndex = block.indexOf("\n    ports:\n");
      if (portsIndex !== -1) block = block.slice(0, portsIndex) + `\n    volumes:\n      - ${line}\n` + block.slice(portsIndex);
      else block = block.trimEnd() + `\n    volumes:\n      - ${line}\n`;
    }
    content = content.replace(match[1], block);
  }

  ensureVolume("frontend", "./knowledge:/knowledge");

  if (content !== original) {
    write(file, content);
    console.log("OK docker-compose.internal.yml: frontend erhält ./knowledge:/knowledge Volume.");
  } else {
    console.log("SKIP docker-compose.internal.yml: Knowledge Volume bereits vorhanden.");
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["knowledge:admin:verify"] = "node scripts/phase7-6-verify-knowledge-admin.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: knowledge:admin:verify eingetragen.");
}

patchCompose();
patchPackage();
console.log("Phase 7.6 Patch abgeschlossen.");
