const fs = require("fs");
const path = require("path");

const pagePath = path.join(process.cwd(), "frontend", "app", "analytics", "page.tsx");

if (!fs.existsSync(pagePath)) {
  console.error("frontend/app/analytics/page.tsx wurde nicht gefunden.");
  process.exit(1);
}

let content = fs.readFileSync(pagePath, "utf8");
const original = content;

const brokenSnippet = "<AgentRoutingAnalyticsPanel analytics={analytics} />";

if (!content.includes(brokenSnippet)) {
  console.log("Kein kaputter analytics={analytics}-Snippet gefunden. Keine Änderung nötig.");
  process.exit(0);
}

function findAnalyticsVariable(source) {
  const candidates = [];

  // 1) Häufig: vorhandene UI nutzt variable.totalEntries / variable.directCount etc.
  const fieldPatterns = [
    /\b([A-Za-z_$][\w$]*)\??\.totalEntries\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.directCount\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.councilCount\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.topRecommendations\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.topPatterns\b/g,
  ];

  for (const pattern of fieldPatterns) {
    let match;
    while ((match = pattern.exec(source)) !== null) {
      if (!candidates.includes(match[1])) candidates.push(match[1]);
    }
  }

  // 2) useState<AnalyticsResponse...>-Variable suchen
  const statePattern = /const\s*\[\s*([A-Za-z_$][\w$]*)\s*,\s*[A-Za-z_$][\w$]*\s*\]\s*=\s*useState\s*<\s*AnalyticsResponse/g;
  let stateMatch;
  while ((stateMatch = statePattern.exec(source)) !== null) {
    if (!candidates.includes(stateMatch[1])) candidates.push(stateMatch[1]);
  }

  // 3) Typische Namen bevorzugen, falls vorhanden
  const preferred = ["analyticsData", "analyticsResponse", "analyticsSummary", "summary", "stats", "data", "analytics"];
  for (const name of preferred) {
    if (candidates.includes(name)) return name;
  }

  return candidates[0];
}

const detected = findAnalyticsVariable(content);

if (!detected) {
  console.error("Konnte die Analytics-State-Variable nicht automatisch erkennen.");
  console.error("Bitte frontend/app/analytics/page.tsx prüfen und analytics={analytics} manuell auf die vorhandene Datenvariable ändern.");
  process.exit(1);
}

content = content.replace(brokenSnippet, `<AgentRoutingAnalyticsPanel analytics={${detected}} />`);

if (content !== original) {
  fs.writeFileSync(pagePath, content, "utf8");
  console.log(`Analytics UI Fix angewendet: analytics={analytics} -> analytics={${detected}}`);
} else {
  console.log("Keine Änderung vorgenommen.");
}
