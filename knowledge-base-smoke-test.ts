import { createKnowledgeSeedFile, loadKnowledgeDocuments, searchKnowledgeBase } from "./knowledge-base";

async function main() {
  const seedPath = await createKnowledgeSeedFile();
  console.log(`Seed-Datei erstellt/aktualisiert: ${seedPath}`);

  const documents = await loadKnowledgeDocuments();
  console.log(`Dokumente geladen: ${documents.length}`);

  const queries = [
    "suggestedAgents routingDetails",
    "Agent Routing Analytics",
    "Privacy Risiken",
  ];

  for (const query of queries) {
    const results = await searchKnowledgeBase(query, { limit: 3 });
    console.log("======================================");
    console.log(`Query: ${query}`);
    if (results.length === 0) {
      console.log("Keine Treffer.");
      continue;
    }

    for (const result of results) {
      console.log(`- ${result.title} | Score: ${result.score} | Tags: ${result.tags.join(", ")}`);
      console.log(`  ${result.snippet}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
