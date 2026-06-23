
import readline from "node:readline";
import { runMasterAgent, type MasterAgentResult } from "./master-agent";
import type { OutputMode } from "./agent-response";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function looksLikeShellCommand(input: string): boolean {
  const trimmed = input.trim().toLowerCase();

  const shellStarts = [
    "npm ",
    "npx ",
    "node ",
    "git ",
    "pnpm ",
    "yarn ",
    "ts-node ",
    "tsx ",
    "python ",
    "pip ",
    "dir",
    "ls",
    "cd ",
    "mkdir ",
    "rm ",
    "del ",
    "copy ",
    "move ",
    "type ",
    "cat ",
    "cls",
    "clear",
    "echo ",
    "powershell ",
    "cmd ",
  ];

  return shellStarts.some(prefix => trimmed.startsWith(prefix));
}

function printHelp() {
  console.log(`
Verfügbare Kommandos:
- exit        -> beendet die CLI
- :json on    -> JSON-Modus aktivieren
- :json off   -> Markdown-Modus aktivieren
- :debug on   -> Debug-JSON mit councilResult aktivieren
- :debug off  -> Debug-JSON deaktivieren
- :help       -> Hilfe anzeigen

Wichtig:
Diese CLI ist ein Chat mit dem Master-Agenten.
Shell-Befehle wie 'npm run ...' oder 'git status' bitte im normalen Terminal ausführen.
`);
}

async function main() {
  console.log("======================================");
  console.log(" Master-Agent CLI gestartet");
  console.log(" Schreibe 'exit' zum Beenden.");
  console.log(" Schreibe ':json on' oder ':json off'.");
  console.log(" Schreibe ':debug on' oder ':debug off'.");
  console.log(" Schreibe ':help' für Hilfe.");
  console.log("======================================\n");

  const sharedContext: string[] = [
    "Du bist in einer lokalen CLI-Testumgebung.",
    "Der Master-Agent ist die primäre Gesprächsinstanz.",
    "Der Rat soll nur bei Tradeoffs, Unsicherheit und kritischen Entscheidungen intern zugeschaltet werden."
  ];

  let outputMode: OutputMode = "markdown";
  let includeCouncilResult = false;

  while (true) {
    const userInput = (await ask("Du: ")).trim();

    if (!userInput) {
      continue;
    }

    const lowered = userInput.toLowerCase();

    if (lowered === "exit") {
      console.log("\nCLI beendet.");
      break;
    }

    if (lowered === ":help") {
      printHelp();
      continue;
    }

    if (lowered === ":json on") {
      outputMode = "json";
      console.log("\nJSON-Modus aktiviert.\n");
      continue;
    }

    if (lowered === ":json off") {
      outputMode = "markdown";
      console.log("\nMarkdown-Modus aktiviert.\n");
      continue;
    }

    if (lowered === ":debug on") {
      includeCouncilResult = true;
      console.log("\nDebug-JSON aktiviert.\n");
      continue;
    }

    if (lowered === ":debug off") {
      includeCouncilResult = false;
      console.log("\nDebug-JSON deaktiviert.\n");
      continue;
    }

    if (looksLikeShellCommand(userInput)) {
      console.log("\n⚠️ Das sieht nach einem Shell-Befehl aus.");
      console.log("Bitte beende die Agent-CLI mit 'exit' und führe den Befehl im normalen PowerShell-/Terminal-Fenster aus.");
      console.log("\nBeispiel:");
      console.log("  exit");
      console.log("  npm run json:test");
      console.log("\n--------------------------------------\n");
      continue;
    }

    try {
      const result: MasterAgentResult = await runMasterAgent({
        userInput,
        context: sharedContext,
        outputMode,
        includeCouncilResult,
      });

      console.log(`\nRoute: ${result.route}`);
      console.log(`Format: ${result.format}\n`);

      if (result.format === "json") {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result.answer);
      }

      console.log("\n--------------------------------------\n");
    } catch (err) {
      console.error("\nFehler im Master-Agent:");
      console.error(err);
      console.log("\n--------------------------------------\n");
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error("Fataler CLI-Fehler:");
  console.error(err);
  rl.close();
});
``
