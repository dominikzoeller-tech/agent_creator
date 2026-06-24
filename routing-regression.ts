import { shouldInvokeCouncil, classifyIntent } from "./council-engine";

type ExpectedRoute = "direct" | "council";

interface RoutingCase {
  name: string;
  input: string;
  context?: string[];
  expectedRoute: ExpectedRoute;
  expectedIntent?: "factual" | "decision" | "creative" | "unclear";
}

interface RoutingResult {
  passed: boolean;
  name: string;
  expectedRoute: ExpectedRoute;
  actualRoute: ExpectedRoute;
  expectedIntent?: string;
  actualIntent?: string;
  input: string;
}

const sharedContext = [
  "Der Master-Agent ist die primäre Gesprächsinstanz.",
  "Der Rat soll nur bei Tradeoffs, Unsicherheit und kritischen Entscheidungen zugeschaltet werden.",
];

const ROUTING_CASES: RoutingCase[] = [
  {
    name: "Faktenfrage: TypeScript vs JavaScript",
    input: "Was ist der Unterschied zwischen TypeScript und JavaScript?",
    expectedRoute: "direct",
    expectedIntent: "factual",
  },
  {
    name: "Faktenfrage: JSON erklären",
    input: "Erkläre mir kurz, was JSON ist.",
    expectedRoute: "direct",
    expectedIntent: "factual",
  },
  {
    name: "Faktenfrage: Promises erklären",
    input: "Wie funktionieren Promises in JavaScript?",
    expectedRoute: "direct",
    expectedIntent: "factual",
  },
  {
    name: "Entscheidungsfrage: CLI oder JSON-Output zuerst",
    input: "Soll ich zuerst die CLI fertig bauen oder zuerst JSON-Output standardisieren?",
    expectedRoute: "council",
    expectedIntent: "decision",
  },
  {
    name: "Entscheidungsfrage: hin- und hergerissen",
    input: "Ich bin hin- und hergerissen: Soll ich zuerst Stabilität oder Geschwindigkeit priorisieren?",
    expectedRoute: "council",
    expectedIntent: "decision",
  },
  {
    name: "Expliziter Rat-Trigger",
    input: "rat das durch: Soll ich den Rat später als Modul ausbauen oder erstmal nur die Kernarchitektur stabilisieren?",
    expectedRoute: "council",
    expectedIntent: "decision",
  },
  {
    name: "Expliziter Rat-Trigger: pressure-test",
    input: "pressure-test das: Soll ich zuerst deployen oder zuerst härten?",
    expectedRoute: "council",
    expectedIntent: "decision",
  },
  {
    name: "Grenzfall: Vergleich",
    input: "Vergleiche TypeScript und JavaScript.",
    expectedRoute: "direct",
    expectedIntent: "factual",
  },
  {
    name: "Grenzfall: Welche Vor- und Nachteile",
    input: "Welche Vor- und Nachteile hat ein modularer Master-Agent?",
    expectedRoute: "direct",
    expectedIntent: "unclear",
  },
  {
    name: "Grenzfall: Ist das der richtige Move?",
    input: "Ist das der richtige Move, zuerst zu deployen?",
    expectedRoute: "council",
    expectedIntent: "decision",
  },
];

function resolveRoute(input: string, context: string[] = []): ExpectedRoute {
  return shouldInvokeCouncil(input, context) ? "council" : "direct";
}

function runRoutingRegression(): RoutingResult[] {
  return ROUTING_CASES.map((testCase) => {
    const actualRoute = resolveRoute(testCase.input, testCase.context ?? sharedContext);
    const actualIntent = classifyIntent(testCase.input);

    const routeOk = actualRoute === testCase.expectedRoute;
    const intentOk =
      typeof testCase.expectedIntent === "undefined"
        ? true
        : actualIntent === testCase.expectedIntent;

    return {
      passed: routeOk && intentOk,
      name: testCase.name,
      expectedRoute: testCase.expectedRoute,
      actualRoute,
      expectedIntent: testCase.expectedIntent,
      actualIntent,
      input: testCase.input,
    };
  });
}

function printResults(results: RoutingResult[]) {
  console.log("======================================");
  console.log(" Routing Regression gestartet");
  console.log("======================================\n");

  let failures = 0;

  for (const result of results) {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name}`);
    console.log(`   Input           : ${result.input}`);
    console.log(`   Erwartete Route : ${result.expectedRoute}`);
    console.log(`   Tatsächliche Route: ${result.actualRoute}`);

    if (typeof result.expectedIntent !== "undefined") {
      console.log(`   Erwarteter Intent : ${result.expectedIntent}`);
      console.log(`   Tatsächlicher Intent: ${result.actualIntent}`);
    }

    console.log("");

    if (!result.passed) {
      failures += 1;
    }
  }

  console.log("--------------------------------------");
  console.log(`Gesamtfälle : ${results.length}`);
  console.log(`Fehler      : ${failures}`);
  console.log(`Bestanden   : ${results.length - failures}`);
  console.log("--------------------------------------");

  if (failures > 0) {
    console.log("\nROUTING REGRESSION: FAILED");
    process.exitCode = 1;
    return;
  }

  console.log("\nROUTING REGRESSION: OK");
}

function main() {
  const results = runRoutingRegression();
  printResults(results);
}

main();
