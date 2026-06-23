
import { runMasterAgent } from "./master-agent";

async function main() {
  console.log("master-test.ts wurde gestartet");

  const sharedContext = [
    "Ziel ist ein produktiv nutzbares Agentensystem.",
    "Der Hauptagent soll die primäre Gesprächsinstanz bleiben.",
    "Der Rat soll nur bei Tradeoffs, Unsicherheit und kritischen Entscheidungen zugeschaltet werden."
  ];

  console.log("\n==============================");
  console.log("TEST 1: Faktische Frage -> direct");
  console.log("==============================\n");

  const factual = await runMasterAgent({
    userInput: "Was ist der Unterschied zwischen TypeScript und JavaScript?",
    context: sharedContext,
    outputMode: "markdown",
  });

  console.log("ROUTE:", factual.route);
  console.log("\nOUTPUT:\n");
  console.log(factual.answer);

  console.log("\n==============================");
  console.log("TEST 2: Ratsfrage -> council");
  console.log("==============================\n");

  const council = await runMasterAgent({
    userInput:
      "Ich bin hin- und hergerissen: Soll ich zuerst die CLI fertig bauen oder zuerst JSON-Output für andere Agenten standardisieren?",
    context: sharedContext,
    outputMode: "markdown",
  });

  console.log("ROUTE:", council.route);
  console.log("\nOUTPUT:\n");
  console.log(council.answer);

  console.log("\n==============================");
  console.log("TEST 3: JSON-Modus");
  console.log("==============================\n");

  const jsonResult = await runMasterAgent({
    userInput:
      "rat das durch: Soll ich den Rat später als weiteres Modul ausbauen oder erstmal nur die Kernarchitektur stabilisieren?",
    context: sharedContext,
    outputMode: "json",
  });

  console.log(JSON.stringify(jsonResult, null, 2));

  console.log("\nFERTIG");
}

main().catch((err) => {
  console.error("\nFEHLER IN master-test.ts:");
  console.error(err);
});
