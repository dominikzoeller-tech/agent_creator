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
console.log(" Phase 8.4 Memory Logs/Analytics Verify");
console.log("======================================");

let ok = true;
ok = check("frontend/app/api/analytics/route.ts", ["memoryUsedCount", "memoryUsedSharePercent", "topMemoryTypes", "topMemoryTags", "topMemoryTitles"]) && ok;
ok = check("frontend/lib/types.ts", ["memoryUsedCount?: number", "topMemoryTypes?: TopItem[]", "topMemoryTags?: TopItem[]", "topMemoryTitles?: TopItem[]"]) && ok;
ok = check("frontend/components/MemoryAnalyticsPanel.tsx", ["Memory-Analytics", "topMemoryTypes", "memoryUsedCount"]) && ok;
ok = check("frontend/app/analytics/page.tsx", ["MemoryAnalyticsPanel"]) && ok;

if (!ok) {
  console.error("Verify fehlgeschlagen.");
  process.exit(1);
}

console.log("Verify OK. Memory Logs/Analytics sind vorbereitet.");
