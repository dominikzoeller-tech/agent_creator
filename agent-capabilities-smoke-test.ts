import { suggestAgentCapabilities } from "./agent-capabilities";

const examples = [
  "Soll ich Docker oder lokalen Start priorisieren?",
  "Bitte prüfe Datenschutz und Redaction für confidential Inhalte.",
  "Erstelle mir eine Roadmap mit nächsten Schritten für Phase 6.",
  "Welche Risiken hat das interne Deployment und wie härten wir es?",
  "Bitte aktualisiere die README und formuliere die Doku verständlicher.",
  "Vergleiche aktuelle Best Practices für Docker Compose Healthchecks.",
  "Ich brauche eine Empfehlung zwischen API-Ausbau und Frontend-Polish.",
];

for (const input of examples) {
  const suggested = suggestAgentCapabilities(input).map((capability) => capability.id);
  console.log("======================================");
  console.log(`Input: ${input}`);
  console.log(`Suggested: ${suggested.join(", ")}`);
}
