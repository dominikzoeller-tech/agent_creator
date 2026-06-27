import { buildCouncilRoutingMetadata } from "./council-routing-metadata";

const examples = [
  {
    userInput: "Soll ich die Council-Logik oder das Frontend als nächstes ausbauen?",
    sensitivity: "internal" as const,
    processingMode: "auto" as const,
  },
  {
    userInput: "Restricted: Wie soll diese geheime Projektinformation verarbeitet werden?",
    sensitivity: "restricted" as const,
    processingMode: "local_only" as const,
  },
  {
    userInput: "Bitte erstelle eine technische Roadmap mit Risiken, Docker und API-Schritten.",
    sensitivity: "internal" as const,
    processingMode: "hybrid" as const,
  },
];

for (const example of examples) {
  const metadata = buildCouncilRoutingMetadata(example);
  console.log("======================================");
  console.log(`Input: ${example.userInput}`);
  console.log(`Route Suggestion: ${metadata.routeSuggestion}`);
  console.log(`Should Use Council: ${metadata.shouldUseCouncil}`);
  console.log(`Suggested Agents: ${metadata.suggestedAgents.join(", ")}`);
  console.log(`Summary: ${metadata.summary}`);
  console.log(`Reason: ${metadata.routingDetails.reason}`);
}
