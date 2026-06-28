const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchToolEnforcementPrep() {
  const file = "tool-enforcement-prep.ts";
  if (!exists(file)) throw new Error(`${file} nicht gefunden. Phase 10.6 muss vorhanden sein.`);
  let content = read(file);
  const original = content;

  if (!content.includes("consentRequired:")) {
    content = content.replace("  mode: \"off\" | \"dry-run\" | \"enforce\";", "  mode: \"off\" | \"dry-run\" | \"enforce\";\n  consentRequired: boolean;\n  hardBlocked: boolean;");

    content = content.replace(/mode: "off",/g, "mode: \"off\",\n      consentRequired: confirmationRequiredDecisions.length > 0,\n      hardBlocked: false,");
    content = content.replace(/mode,\n  };/g, "mode,\n    consentRequired: confirmationRequiredDecisions.length > 0,\n    hardBlocked: config.enabled && !config.dryRun && wouldBlock,\n  };");
  }

  if (!content.includes("TOOL_PERMISSION_REQUIRE_EXPLICIT_CONSENT")) {
    content = content.replace("    requireConfirmationForHighRisk: process.env.TOOL_PERMISSION_REQUIRE_CONFIRMATION_FOR_HIGH_RISK !== \"false\",", "    requireConfirmationForHighRisk: process.env.TOOL_PERMISSION_REQUIRE_CONFIRMATION_FOR_HIGH_RISK !== \"false\",\n    // Phase 11.0: explicit consent flag is informational for UI/rollout.\n    // Hard consent persistence/execution is planned for a later dedicated phase.\n    // TOOL_PERMISSION_REQUIRE_EXPLICIT_CONSENT=true enables stronger UI messaging.");
  }

  if (content !== original) {
    write(file, content);
    console.log("OK tool-enforcement-prep.ts: consentRequired/hardBlocked ergänzt.");
  } else console.log("SKIP tool-enforcement-prep.ts: bereits vorbereitet.");
}

function patchServerHardBlock() {
  const file = "server.ts";
  if (!exists(file)) throw new Error(`${file} nicht gefunden.`);
  let content = read(file);
  const original = content;

  if (!content.includes("toolEnforcement.hardBlocked")) {
    const marker = "  const memory = await buildProjectMemoryContext(effectiveUserInput, { limit: 5 });\n";
    if (!content.includes(marker)) throw new Error("Memory Marker in server.ts nicht gefunden.");
    const block = `  if (toolEnforcement.hardBlocked) {\n    return res.json({\n      ok: true,\n      mode: \"cloud\",\n      result: {\n        answer: \"Diese Anfrage wurde durch Tool Permission Enforcement blockiert. Bitte Sensitivity, Processing Mode oder Tool-Anfrage prüfen.\",\n        toolPreflight,\n        toolEnforcement,\n      },\n    });\n  }\n\n`;
    content = content.replace(marker, block + marker);
  }

  if (content !== original) {
    write(file, content);
    console.log("OK server.ts: Hard Enforcement Gate ergänzt.");
  } else console.log("SKIP server.ts: Hard Enforcement Gate bereits vorhanden.");
}

function patchFrontendTypes() {
  const file = "frontend/lib/types.ts";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  if (!content.includes("toolConsent?: unknown;")) {
    if (content.includes("  toolEnforcement?: unknown;\n")) content = content.replace("  toolEnforcement?: unknown;\n", "  toolEnforcement?: unknown;\n  toolConsent?: unknown;\n");
  }
  if (content !== original) {
    write(file, content);
    console.log("OK frontend/lib/types.ts: toolConsent Platzhalter ergänzt.");
  }
}

function patchFrontendPage() {
  const file = "frontend/app/page.tsx";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  const importLine = 'import { ToolConsentPanel } from "../components/ToolConsentPanel";';
  if (!content.includes(importLine)) {
    const lines = content.split(/\r?\n/);
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("import ")) lastImport = i;
    if (lastImport !== -1) {
      lines.splice(lastImport + 1, 0, importLine);
      content = lines.join("\n");
    }
  }
  if (!content.includes("<ToolConsentPanel response={response} />")) {
    const insertLine = "                <ToolConsentPanel response={response} />";
    const enforcementPanelRegex = /^(\s*<ToolEnforcementPanel\s+response=\{response\}\s*\/>)\s*$/m;
    if (enforcementPanelRegex.test(content)) content = content.replace(enforcementPanelRegex, `$1\n${insertLine}`);
    else {
      const mainClose = content.lastIndexOf("</main>");
      if (mainClose !== -1) content = content.slice(0, mainClose) + insertLine + "\n" + content.slice(mainClose);
    }
  }
  if (content !== original) {
    write(file, content);
    console.log("OK frontend/app/page.tsx: ToolConsentPanel eingebunden.");
  }
}

function patchEnvExample() {
  const file = ".env.example";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  if (!content.includes("TOOL_PERMISSION_REQUIRE_EXPLICIT_CONSENT")) {
    content += "\n# Phase 11 Hard Tool Enforcement & Consent\nTOOL_PERMISSION_REQUIRE_EXPLICIT_CONSENT=true\n";
  }
  if (content !== original) {
    write(file, content);
    console.log("OK .env.example: Phase 11 Consent Flag ergänzt.");
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["tools:enforcement:hard:verify"] = "node scripts/phase11-0-verify-hard-tool-enforcement-consent.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: tools:enforcement:hard:verify eingetragen.");
}

patchToolEnforcementPrep();
patchServerHardBlock();
patchFrontendTypes();
patchFrontendPage();
patchEnvExample();
patchPackage();
console.log("Phase 11.0 Patch abgeschlossen.");
