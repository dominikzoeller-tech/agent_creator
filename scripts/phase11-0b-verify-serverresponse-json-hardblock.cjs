const fs = require("fs");
const path = require("path");

function check(file, patterns) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) { console.log(`MISS ${file}`); return false; }
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
console.log(" Phase 11.0b ServerResponse JSON Fix Verify");
console.log("======================================");

let ok = true;
ok = check("server.ts", [
  "toolEnforcement.hardBlocked",
  "res.writeHead(200",
  "res.end(JSON.stringify(payload))",
]) && ok;

const content = fs.readFileSync(path.join(process.cwd(), "server.ts"), "utf8");
if (content.includes("return res.json")) {
  console.log("MISS server.ts: return res.json ist noch vorhanden");
  ok = false;
} else {
  console.log("OK   server.ts: kein return res.json mehr vorhanden");
}

if (!ok) {
  console.error("Verify fehlgeschlagen.");
  process.exit(1);
}

console.log("Verify OK. ServerResponse JSON Fix ist vorbereitet.");
