const fs = require("fs");
const path = require("path");

const readmePath = path.join(process.cwd(), "README.md");
const sectionPath = path.join(process.cwd(), "README-phase6-agent-routing-section.md");

if (!fs.existsSync(readmePath)) {
  console.error("README.md wurde nicht gefunden.");
  process.exit(1);
}
if (!fs.existsSync(sectionPath)) {
  console.error("README-phase6-agent-routing-section.md wurde nicht gefunden.");
  process.exit(1);
}

const start = "<!-- PHASE6_AGENT_ROUTING_START -->";
const end = "<!-- PHASE6_AGENT_ROUTING_END -->";
const section = fs.readFileSync(sectionPath, "utf8").trim() + "\n";
let readme = fs.readFileSync(readmePath, "utf8");

const startIndex = readme.indexOf(start);
const endIndex = readme.indexOf(end);

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
  readme = `${readme.slice(0, startIndex).trimEnd()}\n\n${section}\n${readme.slice(endIndex + end.length).trimStart()}`.trimEnd() + "\n";
} else {
  readme = `${readme.trimEnd()}\n\n${section}`;
}

fs.writeFileSync(readmePath, readme, "utf8");
console.log("README.md wurde um Phase-6-Agenten-Routing ergänzt/aktualisiert.");
