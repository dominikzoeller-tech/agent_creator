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
console.log(" Phase 8.3 Memory Frontend Visibility Verify");
console.log("======================================");

let ok = true;
ok = check("frontend/components/MemoryHitsPanel.tsx", ["Project Memory Treffer", "usedMemory", "memoryHits", "memorySummary"]) && ok;
ok = check("frontend/lib/types.ts", ["ProjectMemoryEntry", "usedMemory?: boolean", "memoryHits?: ProjectMemoryEntry[]"]) && ok;
ok = check("frontend/app/page.tsx", ["MemoryHitsPanel", "<MemoryHitsPanel response={response} />"]) && ok;

if (!ok) {
  console.error("Verify fehlgeschlagen.");
  process.exit(1);
}

console.log("Verify OK. Memory Hits sind im Frontend sichtbar vorbereitet.");
