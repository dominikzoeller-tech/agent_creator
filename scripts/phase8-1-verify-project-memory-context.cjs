const fs = require("fs");
const path = require("path");

function check(file, patterns) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) {
    console.log(`MISS ${file}`);
    return false;
  }
  const content = fs.readFileSync(full, "utf8");
  let ok = true;
  for (const pattern of patterns) {
    const found = content.includes(pattern);
    console.log(`${found ? "OK  " : "MISS"} ${file}: ${pattern}`);
    if (!found) ok = false;
  }
  return ok;
}

console.log("======================================");
console.log(" Phase 8.1 Project Memory Context Verify");
console.log("======================================");

let ok = true;
ok = check("project-memory-context.ts", [
  "buildProjectMemoryContext",
  "mergeProjectMemoryContext",
  "Lokaler Project-Memory-Kontext",
  "ProjectMemoryContext"
]) && ok;
ok = check("project-memory-context-smoke-test.ts", [
  "Project Memory Context Smoke Test OK",
  "buildProjectMemoryContext",
  "mergeProjectMemoryContext"
]) && ok;

if (!ok) {
  console.error("Verify fehlgeschlagen.");
  process.exit(1);
}

console.log("Verify OK. Project Memory Context Bridge ist vorbereitet.");
