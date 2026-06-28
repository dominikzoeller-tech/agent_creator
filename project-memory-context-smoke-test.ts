import { createProjectMemorySeed } from "./project-memory";
import { buildProjectMemoryContext, mergeProjectMemoryContext } from "./project-memory-context";

async function main() {
  await createProjectMemorySeed();

  const examples = [
    "Was wurde in Phase 7 zum Knowledge Layer erreicht?",
    "Warum bleiben Knowledge und Memory getrennt?",
    "Welche Projektentscheidungen gibt es zum Memory Layer?",
  ];

  for (const example of examples) {
    const memory = await buildProjectMemoryContext(example, { limit: 5 });
    const merged = mergeProjectMemoryContext(["Bestehender Agent-Kontext"], memory);

    console.log("======================================");
    console.log(`Input: ${example}`);
    console.log(`Has Hits: ${memory.hasHits}`);
    console.log(`Summary: ${memory.summary}`);
    console.log("Context Lines:");
    for (const line of memory.contextLines) {
      console.log(`- ${line}`);
    }
    console.log("Merged Context:");
    for (const line of merged) {
      console.log(`- ${line}`);
    }
  }

  console.log("Project Memory Context Smoke Test OK.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
