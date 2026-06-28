import { addProjectMemory, createProjectMemorySeed, loadProjectMemory, searchProjectMemory } from "./project-memory";

async function main() {
  const seed = await createProjectMemorySeed();
  console.log(`Seed Memory: ${seed.title}`);

  await addProjectMemory({
    type: "decision",
    title: "Knowledge und Memory bleiben getrennt",
    summary:
      "Knowledge-Dateien enthalten bearbeitbare Dokumente. Project Memory enthält strukturierte Projektentscheidungen, Meilensteine und Systemzustände.",
    tags: ["phase8", "memory", "architecture"],
    source: "phase8.0-smoke",
  });

  const entries = await loadProjectMemory();
  console.log(`Memory Entries: ${entries.length}`);

  const results = await searchProjectMemory("Knowledge Memory Projektentscheidungen", { limit: 5 });
  console.log("Suchtreffer:");
  for (const result of results) {
    console.log(`- ${result.type}: ${result.title} | Tags: ${result.tags.join(", ")}`);
  }

  if (results.length === 0) {
    console.error("FEHLER: Keine Memory-Treffer gefunden.");
    process.exit(1);
  }

  console.log("Project Memory Smoke Test OK.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
