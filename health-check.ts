import "dotenv/config";
import { runMasterAgent } from "./master-agent";
import { realLLM } from "./real-llm";

type HealthStatus = "PASS" | "FAIL";

interface CheckResult {
  name: string;
  status: HealthStatus;
  details: string;
}

function ok(name: string, details: string): CheckResult {
  return { name, status: "PASS", details };
}

function fail(name: string, details: string): CheckResult {
  return { name, status: "FAIL", details };
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Umgebungsvariable fehlt: ${name}`);
  }
  return value;
}

async function runChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  // 1) ENV prüfen
  try {
    const apiKey = requireEnv("OPENAI_API_KEY");
    const model = requireEnv("OPENAI_MODEL");
    const maskedKey = `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`;
    results.push(ok("ENV", `OPENAI_API_KEY erkannt (${maskedKey}), OPENAI_MODEL=${model}`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter ENV-Fehler";
    results.push(fail("ENV", message));
    return results;
  }

  // 2) Faktenfrage -> direct / markdown
  try {
    const factual = await runMasterAgent(
      {
        userInput: "Was ist der Unterschied zwischen TypeScript und JavaScript?",
        context: [
          "Health Check für den lokalen Master-Agenten.",
          "Faktenfragen sollen direkt beantwortet werden.",
        ],
        outputMode: "markdown",
      },
      realLLM
    );

    if (factual.route !== "direct") {
      results.push(fail("Faktenroute (markdown)", `Erwartet: direct, erhalten: ${factual.route}`));
    } else if (factual.format !== "markdown") {
      results.push(fail("Faktenformat (markdown)", `Erwartet: markdown, erhalten: ${factual.format}`));
    } else if (!factual.answer || factual.answer.trim().length < 20) {
      results.push(fail("Faktenantwort (markdown)", "Direkte Antwort ist leer oder zu kurz."));
    } else {
      results.push(ok("Faktenroute (markdown)", "Faktenfrage wurde korrekt direkt beantwortet."));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    results.push(fail("Faktenroute (markdown)", message));
  }

  // 3) Entscheidungsfrage -> council / markdown
  try {
    const council = await runMasterAgent(
      {
        userInput:
          "Ich bin hin- und hergerissen: Soll ich zuerst die CLI fertig bauen oder zuerst JSON-Output standardisieren?",
        context: [
          "Health Check für den lokalen Master-Agenten.",
          "Tradeoff-Fragen sollen den Rat aktivieren.",
        ],
        outputMode: "markdown",
      },
      realLLM
    );

    if (council.route !== "council") {
      results.push(fail("Council-Route (markdown)", `Erwartet: council, erhalten: ${council.route}`));
    } else if (council.format !== "markdown") {
      results.push(fail("Council-Format (markdown)", `Erwartet: markdown, erhalten: ${council.format}`));
    } else if (!council.answer.includes("## Meine Empfehlung")) {
      results.push(fail("Council-Ausgabe (markdown)", "Council-Markdown enthält keine Empfehlung."));
    } else {
      results.push(ok("Council-Route (markdown)", "Entscheidungsfrage wurde korrekt über den Rat verarbeitet."));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    results.push(fail("Council-Route (markdown)", message));
  }

  // 4) Faktenfrage -> direct / json
  try {
    const factualJson = await runMasterAgent(
      {
        userInput: "Erkläre mir kurz, was JSON ist.",
        context: [
          "Health Check für den lokalen Master-Agenten.",
          "JSON-Modus direct prüfen.",
        ],
        outputMode: "json",
        includeCouncilResult: false,
      },
      realLLM
    );

    if (factualJson.format !== "json") {
      results.push(fail("Faktenformat (json)", `Erwartet: json, erhalten: ${factualJson.format}`));
    } else if (factualJson.route !== "direct") {
      results.push(fail("Faktenroute (json)", `Erwartet: direct, erhalten: ${factualJson.route}`));
    } else if (factualJson.usedCouncil !== false) {
      results.push(fail("Faktenmodus (json)", "usedCouncil sollte false sein."));
    } else if (!factualJson.answer || factualJson.answer.trim().length < 10) {
      results.push(fail("Faktenantwort (json)", "JSON-Antwort ist leer oder zu kurz."));
    } else {
      results.push(ok("Faktenroute (json)", "JSON-Direct-Modus funktioniert."));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    results.push(fail("Faktenroute (json)", message));
  }

  // 5) Entscheidungsfrage -> council / json + recommendation + confidence
  try {
    const councilJson = await runMasterAgent(
      {
        userInput:
          "rat das durch: Soll ich den Rat später als weiteres Modul ausbauen oder erstmal nur die Kernarchitektur stabilisieren?",
        context: [
          "Health Check für den lokalen Master-Agenten.",
          "JSON-Modus council prüfen.",
        ],
        outputMode: "json",
        includeCouncilResult: true,
      },
      realLLM
    );

    if (councilJson.format !== "json") {
      results.push(fail("Council-Format (json)", `Erwartet: json, erhalten: ${councilJson.format}`));
    } else {
      const confidenceOk = typeof councilJson.confidence === "number" && councilJson.confidence > 0;
      const recommendationOk =
        typeof councilJson.recommendation === "string" && councilJson.recommendation.trim().length > 10;
      const firstStepOk = typeof councilJson.firstStep === "string" && councilJson.firstStep.trim().length > 10;

      if (councilJson.route !== "council") {
        results.push(fail("Council-Route (json)", `Erwartet: council, erhalten: ${councilJson.route}`));
      } else if (councilJson.usedCouncil !== true) {
        results.push(fail("Council-Modus (json)", "usedCouncil sollte true sein."));
      } else if (!recommendationOk || !firstStepOk || !confidenceOk) {
        results.push(
          fail(
            "Council-Inhalt (json)",
            `recommendationOk=${recommendationOk}, firstStepOk=${firstStepOk}, confidenceOk=${confidenceOk}`
          )
        );
      } else {
        results.push(ok("Council-Route (json)", "JSON-Council-Modus funktioniert vollständig."));
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    results.push(fail("Council-Route (json)", message));
  }

  return results;
}

async function main() {
  console.log("======================================");
  console.log(" Health Check gestartet");
  console.log("======================================\n");

  const results = await runChecks();
  let failed = 0;

  for (const result of results) {
    const icon = result.status === "PASS" ? "✅" : "❌";
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.details}\n`);

    if (result.status === "FAIL") {
      failed += 1;
    }
  }

  const passed = results.length - failed;

  console.log("--------------------------------------");
  console.log(`Checks gesamt: ${results.length}`);
  console.log(`Bestanden   : ${passed}`);
  console.log(`Fehlgeschlagen: ${failed}`);
  console.log("--------------------------------------");

  if (failed > 0) {
    console.log("\nHEALTH CHECK: FAILED");
    process.exitCode = 1;
    return;
  }

  console.log("\nHEALTH CHECK: OK");
}

main().catch((err) => {
  console.error("Fataler Fehler im health-check.ts:");
  console.error(err);
  process.exitCode = 1;
});
