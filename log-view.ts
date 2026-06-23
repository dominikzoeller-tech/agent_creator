
import { readDecisionLog } from "./decision-log";

async function main() {
  console.log("log-view.ts wurde gestartet\n");

  const entries = await readDecisionLog(10);

  if (entries.length === 0) {
    console.log("Keine geloggten Entscheidungen gefunden.");
    return;
  }

  for (const [index, entry] of entries.entries()) {
    console.log("======================================");
    console.log(`Eintrag #${index + 1}`);
    console.log("======================================");
    console.log("Zeit:", entry.timestamp);
    console.log("Route:", entry.route);
    console.log("Frage:", entry.userInput);
    console.log("Empfehlung:", entry.recommendation ?? "-");
    console.log("Erster Schritt:", entry.firstStep ?? "-");
    console.log(
      "Konfidenz:",
      typeof entry.confidence === "number"
        ? `${Math.round(entry.confidence * 100)}%`
        : "-"
    );

    if (entry.extractedOptions && entry.extractedOptions.length > 0) {
      console.log("Optionen:");
      for (const option of entry.extractedOptions) {
        console.log("-", option);
      }
    }

    console.log("");
  }
}

main().catch((err) => {
  console.error("Fehler in log-view.ts:");
  console.error(err);
});
``
