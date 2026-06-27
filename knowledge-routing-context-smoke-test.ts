import { createKnowledgeSeedFile } from "./knowledge-base";
import { buildKnowledgeRoutingContext, mergeKnowledgeContext } from "./knowledge-routing-context";

async function main() {
  await createKnowledgeSeedFile();

  const examples = [
    "Wie funktionieren suggestedAgents und routingDetails im Agent Routing?",
    "Welche Privacy Risiken zeigt die Routing Analytics?",
    "Soll ich Agent Routing oder Analytics priorisieren?",
  ];

  for (const example of examples) {
    const knowledge = await buildKnowledgeRoutingContext(example, { limit: 3 });
    const merged = mergeKnowledgeContext(["Bestehender Projektkontext"], knowledge);

    console.log("======================================");
    console.log(`Input: ${example}`);
    console.log(`Has Hits: ${knowledge.hasHits}`);
    console.log(`Summary: ${knowledge.summary}`);
    console.log("Context Lines:");
    for (const line of knowledge.contextLines) {
      console.log(`- ${line}`);
    }
    console.log("Merged Context:");
    for (const line of merged) {
      console.log(`- ${line}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
