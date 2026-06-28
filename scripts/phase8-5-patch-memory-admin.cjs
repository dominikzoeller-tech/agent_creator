const fs = require("fs");
const path = require("path");

function read(file) { return fs.readFileSync(path.join(process.cwd(), file), "utf8"); }
function write(file, content) { fs.writeFileSync(path.join(process.cwd(), file), content, "utf8"); }

function patchCompose() {
  const file = "docker-compose.internal.yml";
  let content = read(file);
  const original = content;

  if (!content.includes("./memory:/memory")) {
    const frontendKnowledge = "      - ./knowledge:/knowledge\n";
    if (content.includes(frontendKnowledge)) {
      content = content.replace(frontendKnowledge, frontendKnowledge + "      - ./memory:/memory\n");
    } else {
      console.log("INFO docker-compose.internal.yml: Frontend knowledge volume marker nicht gefunden.");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK docker-compose.internal.yml: frontend erhält ./memory:/memory Volume.");
  } else {
    console.log("SKIP docker-compose.internal.yml: Frontend Memory Volume bereits vorhanden oder nicht geändert.");
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["memory:admin:patch"] = "node scripts/phase8-5-patch-memory-admin.cjs";
  pkg.scripts["memory:admin:verify"] = "node scripts/phase8-5-verify-memory-admin.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: memory:admin:patch und memory:admin:verify eingetragen.");
}

patchCompose();
patchPackage();
console.log("Phase 8.5 Patch abgeschlossen.");
