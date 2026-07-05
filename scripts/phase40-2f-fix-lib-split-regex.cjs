const fs = require("fs");
const path = require("path");

function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function write(file, content) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), content, "utf8");
  console.log("OK " + file);
}
function decodeHtml(content) {
  return content
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function fixLibSplitRegexes() {
  const libDir = full("frontend/lib");
  if (!fs.existsSync(libDir)) {
    throw new Error("frontend/lib nicht gefunden");
  }

  for (const name of fs.readdirSync(libDir)) {
    if (!name.endsWith(".ts")) continue;
    const rel = path.join("frontend/lib", name);
    let content = decodeHtml(read(rel));
    const before = content;

    // Hard repair for generated corruption:
    // .split(/
    // /).map(...)  -> .split(/\r?\n/).map(...)
    // Uses shortest match up to the next '/).map', so it does not cross function boundaries.
    content = content.replace(/\.split\(\/[\s\S]*?\/\)\.map/g, ".split(/\\r?\\n/).map");

    // Hard repair for generated corruption in appendFileSync newline strings, if present:
    // JSON.stringify(x)+"
    // " -> JSON.stringify(x)+"\n"
    content = content.replace(/JSON\.stringify\(([^)\r\n]+)\)\s*\+\s*"[\s\r\n]*"/g, 'JSON.stringify($1)+"\\n"');

    if (content !== before) {
      write(rel, content);
    }
  }
}

fixLibSplitRegexes();
console.log("Phase 40.2f lib split regex fix completed.");
