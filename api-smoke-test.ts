import "dotenv/config";

type SmokeStatus = "PASS" | "FAIL";

interface SmokeResult {
  name: string;
  status: SmokeStatus;
  details: string;
}

function pass(name: string, details: string): SmokeResult {
  return { name, status: "PASS", details };
}

function fail(name: string, details: string): SmokeResult {
  return { name, status: "FAIL", details };
}

function getBaseUrl(): string {
  const port = Number(process.env.PORT ?? 7071);
  const safePort = Number.isFinite(port) && port > 0 ? port : 7071;
  return `http://localhost:${safePort}`;
}

async function getJson(path: string): Promise<any> {
  const res = await fetch(`${getBaseUrl()}${path}`);
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Antwort von GET ${path} ist kein gültiges JSON: ${text}`);
  }
}

async function postJson(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Antwort von POST ${path} ist kein gültiges JSON: ${text}`);
  }
}

function includesRedaction(text: string): boolean {
  return (
    text.includes("[REDACTED_EMAIL]") ||
    text.includes("[REDACTED_LONG_NUMBER]") ||
    text.includes("[REDACTED_API_KEY]") ||
    text.includes("[REDACTED_UUID]")
  );
}

async function runSmokeTests(): Promise<SmokeResult[]> {
  const results: SmokeResult[] = [];

  // 1) Health
  try {
    const health = await getJson("/health");

    if (health?.ok !== true || health?.status !== "ok") {
      results.push(fail("GET /health", `Unerwartete Antwort: ${JSON.stringify(health)}`));
    } else {
      results.push(pass("GET /health", `Service=${health.service}, Port=${health.port}`));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    results.push(fail("GET /health", message));
  }

  // 2) Redact
  try {
    const redact = await postJson("/v1/redact", {
      userInput:
        "Bitte prüfe die Bilanzdaten von max.mustermann@firma.de mit Kundennummer 1234567890123456 und API-Key sk-test1234567890abcd",
      context: [
        "Interner Finanzkontext",
        "Projekt-ID 550e8400-e29b-41d4-a716-446655440000",
      ],
    });

    const redactedText = String(redact?.redacted ?? "");

    if (redact?.ok !== true) {
      results.push(fail("POST /v1/redact", `ok ist nicht true: ${JSON.stringify(redact)}`));
    } else if (!includesRedaction(redactedText)) {
      results.push(fail("POST /v1/redact", `Keine Maskierung erkennbar: ${redactedText}`));
    } else {
      results.push(pass("POST /v1/redact", "Redaction-Marker wurden korrekt erkannt."));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    results.push(fail("POST /v1/redact", message));
  }

  // 3) Ask internal -> cloud_raw + council
  try {
    const internalAsk = await postJson("/v1/ask", {
      userInput: "Soll ich zuerst die CLI fertig bauen oder zuerst JSON-Output standardisieren?",
      context: [
        "Wir testen die lokale Privacy-First API.",
        "Diese Anfrage ist intern, aber nicht hochkritisch.",
      ],
      outputMode: "json",
      includeCouncilResult: true,
      sensitivity: "internal",
      processingMode: "auto",
      allowCloudForSensitive: false,
    });

    const route = internalAsk?.result?.route;

    if (internalAsk?.ok !== true) {
      results.push(fail("POST /v1/ask (internal)", `ok ist nicht true: ${JSON.stringify(internalAsk)}`));
    } else if (internalAsk?.mode !== "cloud") {
      results.push(fail("POST /v1/ask (internal)", `mode unerwartet: ${internalAsk?.mode}`));
    } else if (internalAsk?.processingPath !== "cloud_raw") {
      results.push(fail("POST /v1/ask (internal)", `processingPath unerwartet: ${internalAsk?.processingPath}`));
    } else if (internalAsk?.redacted !== false) {
      results.push(fail("POST /v1/ask (internal)", `redacted sollte false sein, ist aber: ${internalAsk?.redacted}`));
    } else if (route !== "council") {
      results.push(fail("POST /v1/ask (internal)", `Route unerwartet: ${route}`));
    } else {
      results.push(pass("POST /v1/ask (internal)", "Cloud-Rohpfad + Council-Antwort funktionieren."));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    results.push(fail("POST /v1/ask (internal)", message));
  }

  // 4) Ask confidential -> cloud_redacted
  try {
    const confidentialAsk = await postJson("/v1/ask", {
      userInput: "Bitte bewerte diese vertraulichen Bilanzdaten: Umsatz 987654321012 und Ansprechpartner finance@firma.de",
      context: [
        "Diese Anfrage enthält interne Finanzdaten.",
        "Wir wollen prüfen, ob Redaction vor dem Cloud-Pfad greift.",
      ],
      outputMode: "json",
      includeCouncilResult: false,
      sensitivity: "confidential",
      processingMode: "hybrid",
      allowCloudForSensitive: false,
    });

    if (confidentialAsk?.ok !== true) {
      results.push(fail("POST /v1/ask (confidential)", `ok ist nicht true: ${JSON.stringify(confidentialAsk)}`));
    } else if (confidentialAsk?.mode !== "cloud") {
      results.push(fail("POST /v1/ask (confidential)", `mode unerwartet: ${confidentialAsk?.mode}`));
    } else if (confidentialAsk?.processingPath !== "cloud_redacted") {
      results.push(fail("POST /v1/ask (confidential)", `processingPath unerwartet: ${confidentialAsk?.processingPath}`));
    } else if (confidentialAsk?.redacted !== true) {
      results.push(fail("POST /v1/ask (confidential)", `redacted sollte true sein, ist aber: ${confidentialAsk?.redacted}`));
    } else {
      results.push(pass("POST /v1/ask (confidential)", "Hybrid-Redaction-Pfad funktioniert."));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    results.push(fail("POST /v1/ask (confidential)", message));
  }

  // 5) Ask restricted -> local_policy
  try {
    const restrictedAsk = await postJson("/v1/ask", {
      userInput: "Bitte werte diese streng vertraulichen Bilanzdaten und internen Kennzahlen aus.",
      context: [
        "Diese Anfrage fällt unter restricted.",
        "Cloud-Verarbeitung soll hier standardmäßig blockiert werden.",
      ],
      outputMode: "json",
      includeCouncilResult: false,
      sensitivity: "restricted",
      processingMode: "auto",
      allowCloudForSensitive: false,
    });

    if (restrictedAsk?.ok !== true) {
      results.push(fail("POST /v1/ask (restricted)", `ok ist nicht true: ${JSON.stringify(restrictedAsk)}`));
    } else if (restrictedAsk?.mode !== "local_policy") {
      results.push(fail("POST /v1/ask (restricted)", `mode unerwartet: ${restrictedAsk?.mode}`));
    } else if (restrictedAsk?.processingPath !== "local_policy") {
      results.push(fail("POST /v1/ask (restricted)", `processingPath unerwartet: ${restrictedAsk?.processingPath}`));
    } else if (typeof restrictedAsk?.routeSuggestion !== "string") {
      results.push(fail("POST /v1/ask (restricted)", "routeSuggestion fehlt."));
    } else {
      results.push(pass("POST /v1/ask (restricted)", "Lokaler Policy-Pfad blockiert Cloud-Verarbeitung korrekt."));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    results.push(fail("POST /v1/ask (restricted)", message));
  }

  return results;
}

function printResults(results: SmokeResult[]) {
  console.log("======================================");
  console.log(" API Smoke Test gestartet");
  console.log("======================================\n");

  let failed = 0;

  for (const result of results) {
    const icon = result.status === "PASS" ? "✅" : "❌";
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.details}\n`);

    if (result.status === "FAIL") {
      failed += 1;
    }
  }

  console.log("--------------------------------------");
  console.log(`Checks gesamt : ${results.length}`);
  console.log(`Bestanden     : ${results.length - failed}`);
  console.log(`Fehlgeschlagen: ${failed}`);
  console.log("--------------------------------------");

  if (failed > 0) {
    console.log("\nAPI SMOKE TEST: FAILED");
    process.exitCode = 1;
    return;
  }

  console.log("\nAPI SMOKE TEST: OK");
}

async function main() {
  const results = await runSmokeTests();
  printResults(results);
}

main().catch((err) => {
  console.error("Fataler Fehler in api-smoke-test.ts:");
  console.error(err);
  process.exitCode = 1;
});
