
import {
  handleUserMessage,
  shouldInvokeCouncil,
  type LLMFn,
} from "./council-engine";
import { realLLM } from "./real-llm";

console.log("test.ts wurde gestartet");

const directAnswer: LLMFn = async (prompt: string) => {
  return realLLM(
    [
      "Beantworte die folgende Nutzeranfrage direkt.",
      "Nutze KEINE Rat-Struktur.",
      "Antworte klar, knapp und hilfreich auf Deutsch.",
      "",
      prompt
    ].join("\n")
  );
};

async function main() {
  console.log("main() wurde gestartet");

  const userInput =
    "rat das durch: Soll ich den Rat als Hauptagent bauen oder als spezialisiertes Entscheidungsmodul unter einem Master-Agenten?";

  const context = [
    "Ziel ist ein produktiv nutzbares Agentensystem.",
    "Der Hauptagent soll die primäre Gesprächsinstanz bleiben.",
    "Der Rat soll besonders bei Tradeoffs, Unsicherheit und Entscheidungen mit Einsatz genutzt werden."
  ];

  console.log("shouldInvokeCouncil =", shouldInvokeCouncil(userInput, context));

  const result = await handleUserMessage({
    userInput,
    context,
    llm: realLLM,
    directAnswer,
  });

  console.log("\n=== FINAL OUTPUT ===\n");
  console.log(result);
}

main()
  .then(() => {
    console.log("\nFERTIG");
  })
  .catch((err) => {
    console.error("\nFEHLER IN main():");
    console.error(err);
  });
