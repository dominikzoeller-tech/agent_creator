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
console.log(" Phase 7.3b Knowledge Flow Verify");
console.log("======================================");

let ok = true;
ok = check("server.ts", [
  "buildKnowledgeRoutingContext",
  "mergeKnowledgeContext",
  "const knowledge = await buildKnowledgeRoutingContext",
  "const effectiveContext = mergeKnowledgeContext"
]) && ok;

ok = check("Dockerfile", [
  "COPY knowledge-base.ts ./",
  "COPY knowledge-routing-context.ts ./",
  "COPY knowledge ./knowledge"
]) && ok;

if (!ok) {
  console.error("Verify fehlgeschlagen. Bitte Patch-Ausgabe prüfen.");
  process.exit(1);
}

console.log("Verify OK. Knowledge-Kontext ist in den Agent Flow eingebunden.");
