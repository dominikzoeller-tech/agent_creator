const fs = require("fs");
const path = require("path");

const appDir = path.join(process.cwd(), "frontend", "app");
const pageFiles = [
  path.join(appDir, "page.tsx"),
  path.join(appDir, "logs", "page.tsx"),
  path.join(appDir, "analytics", "page.tsx"),
  path.join(appDir, "system", "page.tsx"),
  path.join(appDir, "knowledge", "page.tsx"),
];

function exists(file) {
  return fs.existsSync(file);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

function ensureKnowledgeNavigation(file) {
  if (!exists(file)) {
    console.log(`SKIP ${path.relative(process.cwd(), file)} nicht vorhanden.`);
    return false;
  }

  let content = read(file);
  const original = content;

  if (content.includes('href="/knowledge"') || content.includes("href='/knowledge'")) {
    console.log(`SKIP ${path.relative(process.cwd(), file)} enthält bereits Knowledge-Link.`);
    return false;
  }

  const knowledgeLink = '          <a className="nav-link" href="/knowledge">Knowledge</a>\n';

  // Projekt nutzt häufig schlichte <a className="nav-link" href="/...">...</a> Navigation.
  const systemLinkRegex = /^(\s*<a\s+className="nav-link"\s+href="\/system">System<\/a>\s*)$/m;
  if (systemLinkRegex.test(content)) {
    content = content.replace(systemLinkRegex, `$1\n${knowledgeLink.trimEnd()}`);
  } else {
    // Fallback für Button-/Link-Varianten: Knowledge direkt nach sichtbarem System-Link einfügen.
    const systemHrefRegex = /(<a[^>]+href=["']\/system["'][^>]*>\s*System\s*<\/a>)/m;
    if (systemHrefRegex.test(content)) {
      content = content.replace(systemHrefRegex, `$1\n${knowledgeLink.trimEnd()}`);
    } else {
      // Fallback für Knowledge-Seite: falls keine Navigation gefunden wird, unter <main> eine kleine Nav ergänzen.
      const mainOpenRegex = /(<main[^>]*>)/m;
      if (mainOpenRegex.test(content)) {
        const navBlock = `$1\n      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>\n        <a className="nav-link" href="/">Chat</a>\n        <a className="nav-link" href="/logs">Logs</a>\n        <a className="nav-link" href="/analytics">Analytics</a>\n        <a className="nav-link" href="/system">System</a>\n        <a className="nav-link" href="/knowledge">Knowledge</a>\n      </nav>`;
        content = content.replace(mainOpenRegex, navBlock);
      } else {
        console.log(`INFO ${path.relative(process.cwd(), file)}: keine sichere Nav-Stelle gefunden.`);
      }
    }
  }

  if (content !== original) {
    write(file, content);
    console.log(`OK ${path.relative(process.cwd(), file)}: Knowledge-Navigation ergänzt.`);
    return true;
  }

  return false;
}

function polishKnowledgePage() {
  const file = path.join(appDir, "knowledge", "page.tsx");
  if (!exists(file)) {
    console.log("SKIP Knowledge Page nicht vorhanden.");
    return false;
  }

  let content = read(file);
  const original = content;

  // Kleine UX-Verbesserung: eindeutiger Hinweis, dass Änderungen lokal gespeichert werden.
  if (!content.includes("Änderungen werden lokal im knowledge-Ordner gespeichert")) {
    const marker = "Unterstützt werden <strong>.md</strong> und <strong>.txt</strong> Dateien.";
    if (content.includes(marker)) {
      content = content.replace(
        marker,
        marker + " Änderungen werden lokal im knowledge-Ordner gespeichert."
      );
    }
  }

  // Kleiner Schnelllink zurück zur Analytics-Seite nach Knowledge-Arbeit.
  if (!content.includes('href="/analytics"') && content.includes("Knowledge Admin")) {
    const marker = "</h1>";
    content = content.replace(
      marker,
      `${marker}\n        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>\n          <a className="nav-link" href="/">Chat</a>\n          <a className="nav-link" href="/analytics">Analytics</a>\n          <a className="nav-link" href="/system">System</a>\n        </div>`
    );
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/app/knowledge/page.tsx: UI-Hinweise ergänzt.");
    return true;
  }

  console.log("SKIP frontend/app/knowledge/page.tsx: UI-Hinweise bereits vorhanden oder keine sichere Stelle gefunden.");
  return false;
}

let changes = 0;
for (const file of pageFiles) {
  if (ensureKnowledgeNavigation(file)) changes += 1;
}
if (polishKnowledgePage()) changes += 1;

console.log(`Phase 7.7 Patch abgeschlossen. Geänderte Bereiche: ${changes}`);
