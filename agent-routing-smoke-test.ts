import { analyzeCouncilRouting } from "./agent-routing-details";

const examples = [
  {
    userInput: "Kurze Frage: Was ist der Health-Endpunkt?",
    sensitivity: "internal" as const,
    processingMode: "auto" as const,
  },
  {
    userInput: "Soll ich als nächstes Docker-Härtung oder bessere Council-Logik priorisieren? Bitte mit Risiken und erstem Schritt.",
    sensitivity: "internal" as const,
    processingMode: "auto" as const,
  },
  {
    userInput: "Bitte prüfe confidential Inhalte mit Datenschutz, Redaction und Cloud/Lokal-Abwägung.",
    sensitivity: "confidential" as const,
    processingMode: "auto" as const,
  },
  {
    userInput: "Plane Phase 6 als Roadmap mit Agenten, Risiko, Umsetzung und Tests.",
    sensitivity: "internal" as const,
    processingMode: "hybrid" as const,
  },
  {
    userInput: "Restricted Projektgeheimnis: Welche Verarbeitung ist erlaubt?",
    sensitivity: "restricted" as const,
    processingMode: "local_only" as const,
  },
];

for (const example of examples) {
  const result = analyzeCouncilRouting(example);
  console.log("======================================");
  console.log(`Input: ${example.userInput}`);
  console.log(`Route: ${result.route}`);
  console.log(`Complexity: ${result.complexity}`);
  console.log(`Privacy Risk: ${result.privacyRisk}`);
  console.log(`Suggested Agents: ${result.suggestedAgents.join(", ")}`);
  console.log(`Reason: ${result.reason}`);
}
