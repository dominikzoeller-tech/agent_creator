const fs = require("fs");
const path = require("path");

function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

const pageFiles = [
  "frontend/app/page.tsx",
  "frontend/app/logs/page.tsx",
  "frontend/app/analytics/page.tsx",
  "frontend/app/system/page.tsx",
  "frontend/app/knowledge/page.tsx",
  "frontend/app/knowledge-quality/page.tsx",
  "frontend/app/memory/page.tsx",
  "frontend/app/memory-quality/page.tsx",
];

function navigationBlock(indent = "      ") {
  return `${indent}<nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
${indent}  <a className="nav-link" href="/">Chat</a>
${indent}  <a className="nav-link" href="/knowledge">Knowledge</a>
${indent}  <a className="nav-link" href="/knowledge-quality">Knowledge Quality</a>
${indent}  <a className="nav-link" href="/memory">Memory</a>
${indent}  <a className="nav-link" href="/memory-quality">Memory Quality</a>
${indent}  <a className="nav-link" href="/analytics">Analytics</a>
${indent}  <a className="nav-link" href="/logs">Logs</a>
${indent}  <a className="nav-link" href="/system">System</a>
${indent}</nav>`;
}

function hasMemoryLinks(content) {
  return content.includes('href="/memory"') && content.includes('href="/memory-quality"');
}

function removeDuplicateSimpleMemoryNav(content) {
  // Entfernt nur exakt einfache doppelte Nav-Blöcke, die vorherige Phasen ggf. zusätzlich eingefügt haben.
  return content.replace(/\n\s*<nav style=\{\{ display: "flex", gap: 12, flexWrap: "wrap"(?:, marginBottom: 18)? \}\}>\s*\n\s*<a className="nav-link" href="\/">Chat<\/a>\s*\n\s*<a className="nav-link" href="\/logs">Logs<\/a>\s*\n\s*<a className="nav-link" href="\/analytics">Analytics<\/a>\s*\n\s*<a className="nav-link" href="\/system">System<\/a>\s*\n\s*<a className="nav-link" href="\/knowledge">Knowledge<\/a>\s*\n\s*<\/nav>/gm, "");
}

function patchPage(file) {
  if (!exists(file)) {
    console.log(`SKIP ${file}: nicht vorhanden.`);
    return;
  }

  let content = read(file);
  const original = content;
  content = removeDuplicateSimpleMemoryNav(content);

  if (!hasMemoryLinks(content)) {
    const mainMatch = content.match(/<main[^>]*>/);
    if (!mainMatch || mainMatch.index === undefined) {
      console.log(`INFO ${file}: kein <main> gefunden.`);
    } else {
      const insertAt = mainMatch.index + mainMatch[0].length;
      content = content.slice(0, insertAt) + "\n" + navigationBlock("      ") + content.slice(insertAt);
    }
  }

  // Falls Knowledge-Link existiert, aber Memory-Links fehlen, direkt daneben ergänzen.
  if (!content.includes('href="/memory"') && content.includes('href="/knowledge-quality"')) {
    content = content.replace(
      /(<a className="nav-link" href="\/knowledge-quality">Knowledge Quality<\/a>)/,
      '$1\n        <a className="nav-link" href="/memory">Memory</a>\n        <a className="nav-link" href="/memory-quality">Memory Quality</a>'
    );
  } else if (!content.includes('href="/memory"') && content.includes('href="/knowledge"')) {
    content = content.replace(
      /(<a className="nav-link" href="\/knowledge">Knowledge<\/a>)/,
      '$1\n        <a className="nav-link" href="/memory">Memory</a>\n        <a className="nav-link" href="/memory-quality">Memory Quality</a>'
    );
  }

  if (content !== original) {
    write(file, content);
    console.log(`OK ${file}: Memory Navigation ergänzt/poliert.`);
  } else {
    console.log(`SKIP ${file}: bereits passend.`);
  }
}

function polishMemoryAdmin() {
  const file = "frontend/app/memory/page.tsx";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;

  if (!content.includes('href="/memory-quality"')) {
    content = content.replace(
      /(<h1 style=\{\{ marginTop: 0 \}\}>Project Memory Admin<\/h1>)/,
      `$1\n        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>\n          <a className="nav-link" href="/memory-quality">Memory Quality prüfen</a>\n          <a className="nav-link" href="/analytics">Memory Analytics</a>\n        </div>`
    );
  }

  if (!content.includes("Memory Admin verwaltet strukturierte Projektentscheidungen")) {
    content = content.replace(
      "Knowledge-Dateien bleiben Dokumente; Project Memory bleibt ein strukturiertes Projektgedächtnis.",
      "Knowledge-Dateien bleiben Dokumente; Project Memory bleibt ein strukturiertes Projektgedächtnis. Memory Admin verwaltet strukturierte Projektentscheidungen, Meilensteine und Systemzustände."
    );
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/app/memory/page.tsx: Admin-Hinweise ergänzt.");
  } else {
    console.log("SKIP frontend/app/memory/page.tsx: Admin-Hinweise bereits vorhanden.");
  }
}

function polishMemoryQuality() {
  const file = "frontend/app/memory-quality/page.tsx";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;

  if (!content.includes('href="/memory"')) {
    content = content.replace(
      /(<h1 style=\{\{ marginTop: 0 \}\}>Memory Quality Checks<\/h1>)/,
      `$1\n        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>\n          <a className="nav-link" href="/memory">Memory Admin öffnen</a>\n          <a className="nav-link" href="/analytics">Analytics öffnen</a>\n        </div>`
    );
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/app/memory-quality/page.tsx: Quality-Schnelllinks ergänzt.");
  } else {
    console.log("SKIP frontend/app/memory-quality/page.tsx: Quality-Schnelllinks bereits vorhanden.");
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["memory:ui:polish"] = "node scripts/phase8-7-patch-memory-ui-polish.cjs";
  pkg.scripts["memory:ui:verify"] = "node scripts/phase8-7-verify-memory-ui-polish.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: memory:ui:polish und memory:ui:verify eingetragen.");
}

for (const file of pageFiles) patchPage(file);
polishMemoryAdmin();
polishMemoryQuality();
patchPackage();
console.log("Phase 8.7 Patch abgeschlossen.");
