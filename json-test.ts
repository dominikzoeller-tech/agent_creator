
import { runMasterAgent } from "./master-agent";

async function main() {
  console.log("json-test.ts wurde gestartet");

  const sharedContext = [
    "Ziel ist ein produktiv nutzbares Agentensystem.",
    "Der Hauptagent soll die primäre Gesprächsinstanz bleiben.",
    "Der Rat soll nur bei Tradeoffs, Unsicherheit und kritischen Entscheidungen zugeschaltet werden."
  ];

  console.log("\n==============================");
  console.log("TEST 1: JSON compact");
  console.log("==============================\n");

  const compact = await runMasterAgent({
    userInput:
      "rat das durch: Soll ich den Rat später als weiteres Modul ausbauen oder erstmal nur die Kernarchitektur stabilisieren?",
    context: sharedContext,
    outputMode: "json",
    includeCouncilResult: false,
  });

  console.log(JSON.stringify(compact, null, 2));

  console.log("\n==============================");
  console.log("TEST 2: JSON debug");
  console.log("==============================\n");

  const debug = await runMasterAgent({
    userInput:
      "rat das durch: Soll ich den Rat später als weiteres Modul ausbauen oder erstmal nur die Kernarchitektur stabilisieren?",
    context: sharedContext,
    outputMode: "json",
    includeCouncilResult: true,
  });

  console.log(JSON.stringify(debug, null, 2));

  console.log("\n==============================");
  console.log("TEST 3: factual direct JSON");
  console.log("==============================\n");

  const factual = await runMasterAgent({
    userInput: "Was ist der Unterschied zwischen TypeScript und JavaScript?",
    context: sharedContext,
    outputMode: "json",
    includeCouncilResult: false,
  });

  console.log(JSON.stringify(factual, null, 2));

  console.log("\nFERTIG");
}

main().catch((err) => {
  console.error("\nFEHLER IN json-test.ts:");
  console.error(err);
});
