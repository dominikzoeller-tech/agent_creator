
import { realLLM } from "./real-llm";

async function main() {
  console.log("Starte Smoke-Test...");

  const result = await realLLM(
    'Antworte ausschließlich mit exakt diesem JSON: {"ok": true, "message": "läuft"}'
  );

  console.log("\n=== SMOKE TEST OUTPUT ===");
  console.log(result);
}

main().catch((err) => {
  console.error("\nSMOKE-TEST FEHLER:");
  console.error(err);
});
``
