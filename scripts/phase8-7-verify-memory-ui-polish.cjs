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
console.log(" Phase 8.7 Memory UI Polish Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/page.tsx", ['href="/memory"', 'href="/memory-quality"']) && ok;
ok = check("frontend/app/analytics/page.tsx", ['href="/memory"', 'href="/memory-quality"']) && ok;
ok = check("frontend/app/memory/page.tsx", ["Project Memory Admin", 'href="/memory-quality"', "Memory Admin verwaltet strukturierte Projektentscheidungen"]) && ok;
ok = check("frontend/app/memory-quality/page.tsx", ["Memory Quality Checks", 'href="/memory"']) && ok;

if (!ok) {
  console.error("Verify fehlgeschlagen.");
  process.exit(1);
}
console.log("Verify OK. Memory Navigation & UI Polishing ist vorbereitet.");
