import { createKnowledgeSeedFile, searchKnowledgeBase } from "./knowledge-base";

async function main() {
  await createKnowledgeSeedFile();

  const cases = [
    {
      query: "suggestedAgents routingDetails Agent Routing",
      expectedTitle: "Agent Routing Guide",
    },
    {
      query: "Privacy Risiken Routing Analytics",
      expectedTitle: "Agent Routing Guide",
    },
    {
      query: "irrelevantes zufälliges Wort ohne Treffer xyzabc",
      expectedTitle: null,
    },
  ];

  let failed = 0;

  for (const testCase of cases) {
    const results = await searchKnowledgeBase(testCase.query, { limit: 5, minScore: 2 });
    console.log("======================================");
    console.log(`Query: ${testCase.query}`);
    console.log(`Treffer: ${results.length}`);

    for (const result of results) {
      console.log(`- ${result.title} | Score: ${result.score} | Tags: ${result.tags.join(", ")}`);
      console.log(`  ${result.snippet}`);
    }

    if (testCase.expectedTitle) {
      const found = results.some((result) => result.title === testCase.expectedTitle);
      if (!found) {
        failed += 1;
        console.error(`FEHLER: Erwarteter Treffer fehlt: ${testCase.expectedTitle}`);
      }
    } else if (results.length > 0) {
      failed += 1;
      console.error("FEHLER: Für irrelevante Query wurden Treffer erwartet: 0, erhalten:", results.length);
    }
  }

  if (failed > 0) {
    console.error(`Knowledge Search Tuning Smoke Test fehlgeschlagen: ${failed}`);
    process.exit(1);
  }

  console.log("Knowledge Search Tuning Smoke Test OK.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
