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
console.log(" Phase 8.2 Memory Agent Flow Verify");
console.log("======================================");

let ok = true;
ok = check("server.ts", [
  "buildProjectMemoryContext",
  "mergeProjectMemoryContext",
  "const memory = await buildProjectMemoryContext",
  "const effectiveContext = mergeProjectMemoryContext",
  "usedMemory: memory.hasHits",
  "memorySummary: memory.summary",
  "memoryHits: memory.hits"
]) && ok;
ok = check("Dockerfile", ["COPY project-memory.ts ./", "COPY project-memory-context.ts ./", "COPY memory ./memory"]) && ok;
ok = check("docker-compose.internal.yml", ["./memory:/app/memory"]) && ok;
ok = check("decision-log.ts", ["usedMemory?: boolean", "memorySummary?: string", "memoryHits?: unknown[]"]) && ok;

if (!ok) {
  console.error("Verify fehlgeschlagen.");
  process.exit(1);
}

console.log("Verify OK. Project Memory ist in den Agent Flow integriert.");
