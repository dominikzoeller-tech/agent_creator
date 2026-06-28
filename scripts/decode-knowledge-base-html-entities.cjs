const fs = require("fs");

const file = "knowledge-base.ts";

let content = fs.readFileSync(file, "utf8");

for (let i = 0; i < 5; i++) {
  content = content
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

fs.writeFileSync(file, content, "utf8");

console.log("OK: HTML-Entities in knowledge-base.ts dekodiert.");
