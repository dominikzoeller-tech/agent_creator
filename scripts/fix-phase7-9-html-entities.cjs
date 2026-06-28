const fs = require("fs");

const files = [
  "knowledge-base.ts",
  "scripts/phase7-9-patch-knowledge-search-tuning.cjs"
];

function decodeBasicHtmlEntities(value) {
  let result = value;

  for (let i = 0; i < 3; i++) {
    result = result
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
  }

  return result;
}

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`SKIP ${file} nicht gefunden.`);
    continue;
  }

  const original = fs.readFileSync(file, "utf8");
  const fixed = decodeBasicHtmlEntities(original);

  if (fixed !== original) {
    fs.writeFileSync(file, fixed, "utf8");
    console.log(`OK ${file}: HTML-Entities repariert.`);
  } else {
    console.log(`SKIP ${file}: keine HTML-Entities gefunden.`);
  }
}
