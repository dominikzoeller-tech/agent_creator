import "dotenv/config";

type EnvCheckStatus = "PASS" | "FAIL" | "WARN";

interface EnvCheckResult {
  name: string;
  status: EnvCheckStatus;
  details: string;
}

function pass(name: string, details: string): EnvCheckResult {
  return { name, status: "PASS", details };
}

function fail(name: string, details: string): EnvCheckResult {
  return { name, status: "FAIL", details };
}

function warn(name: string, details: string): EnvCheckResult {
  return { name, status: "WARN", details };
}

function getEnvValue(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function maskSecret(value: string): string {
  if (!value) return "leer";
  if (value.length <= 10) return "***";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function validateOpenAIApiKey(value: string): string | null {
  if (!value) {
    return "OPENAI_API_KEY fehlt.";
  }

  if (!value.startsWith("sk-")) {
    return "OPENAI_API_KEY sieht ungewöhnlich aus. Erwartet wird normalerweise ein Präfix wie 'sk-'.";
  }

  if (value.length < 20) {
    return "OPENAI_API_KEY ist ungewöhnlich kurz und wirkt unvollständig.";
  }

  return null;
}

function validateOpenAIModel(value: string): string | null {
  if (!value) {
    return "OPENAI_MODEL fehlt.";
  }

  if (value.length < 3) {
    return "OPENAI_MODEL ist zu kurz und wirkt ungültig.";
  }

  return null;
}

function runEnvChecks(): EnvCheckResult[] {
  const results: EnvCheckResult[] = [];

  const apiKey = getEnvValue("OPENAI_API_KEY");
  const model = getEnvValue("OPENAI_MODEL");

  const apiKeyValidation = validateOpenAIApiKey(apiKey);
  if (apiKeyValidation) {
    results.push(fail("OPENAI_API_KEY", apiKeyValidation));
  } else {
    results.push(pass("OPENAI_API_KEY", `Erkannt: ${maskSecret(apiKey)}`));
  }

  const modelValidation = validateOpenAIModel(model);
  if (modelValidation) {
    results.push(fail("OPENAI_MODEL", modelValidation));
  } else {
    results.push(pass("OPENAI_MODEL", `Erkannt: ${model}`));
  }

  const missingEnvFileHint = !apiKey && !model;
  if (missingEnvFileHint) {
    results.push(
      warn(
        ".env Hinweis",
        "Weder OPENAI_API_KEY noch OPENAI_MODEL wurden gefunden. Prüfe, ob eine lokale .env-Datei vorhanden ist und korrekt geladen wird."
      )
    );
  }

  return results;
}

function printResults(results: EnvCheckResult[]) {
  console.log("======================================");
  console.log(" ENV Check gestartet");
  console.log("======================================\n");

  let failed = 0;
  let warned = 0;

  for (const result of results) {
    const icon = result.status === "PASS" ? "✅" : result.status === "WARN" ? "⚠️" : "❌";
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.details}\n`);

    if (result.status === "FAIL") failed += 1;
    if (result.status === "WARN") warned += 1;
  }

  const passed = results.length - failed - warned;

  console.log("--------------------------------------");
  console.log(`Checks gesamt   : ${results.length}`);
  console.log(`Bestanden       : ${passed}`);
  console.log(`Warnungen       : ${warned}`);
  console.log(`Fehlgeschlagen  : ${failed}`);
  console.log("--------------------------------------");

  if (failed > 0) {
    console.log("\nENV CHECK: FAILED");
    process.exitCode = 1;
    return;
  }

  if (warned > 0) {
    console.log("\nENV CHECK: WARNINGS");
    return;
  }

  console.log("\nENV CHECK: OK");
}

function main() {
  const results = runEnvChecks();
  printResults(results);
}

main();
