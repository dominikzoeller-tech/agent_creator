const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return fs.readFileSync(full(file), "utf8"); }
function write(file, content){ fs.writeFileSync(full(file), content, "utf8"); }
function patchPackage(){
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["phase11:3:patch"] = "node scripts/phase11-3-patch-consent-resume-approved-execution.cjs";
  pkg.scripts["phase11:3:verify"] = "node scripts/phase11-3-verify-consent-resume-approved-execution.cjs";
  pkg.scripts["tools:consent:resume:verify"] = "node scripts/phase11-3-verify-consent-resume-approved-execution.cjs";
  write(file, JSON.stringify(pkg, null, 2) + "\n");
  console.log("OK package.json: Phase 11.3 Scripts eingetragen.");
}
function patchConsentHelper(){
  const file = "tool-consent-agent-flow.ts";
  if (!exists(file)) throw new Error("tool-consent-agent-flow.ts fehlt. Bitte Phase 11.2 zuerst anwenden.");
  let content = read(file);
  if (!content.includes("getAgentFlowToolConsentRequest")) {
    content += `\n\nexport function getAgentFlowToolConsentRequest(id: string): AgentFlowToolConsentRequest | null {\n  const requestId = id.trim();\n  if (!requestId) return null;\n  const requests = readRequests();\n  const request = requests.find((entry) => entry.id === requestId);\n  if (!request) return null;\n  if (request.status === "pending" && request.expiresAt && new Date(request.expiresAt).getTime() < Date.now()) {\n    request.status = "expired";\n    request.decidedAt = new Date().toISOString();\n    request.decisionNote = request.decisionNote || "Automatisch abgelaufen.";\n    writeRequests(requests);\n  }\n  return request;\n}\n\nexport function isAgentFlowToolConsentApproved(id: string | undefined, toolId?: string): boolean {\n  if (!id) return false;\n  const request = getAgentFlowToolConsentRequest(id);\n  if (!request) return false;\n  if (request.status !== "approved") return false;\n  if (toolId && request.toolId !== toolId) return false;\n  return true;\n}\n`;
    write(file, content);
    console.log("OK tool-consent-agent-flow.ts: Resume/Approved Helper ergänzt.");
  } else {
    console.log("SKIP tool-consent-agent-flow.ts: Resume Helper bereits vorhanden.");
  }
}
function patchServer(){
  const file = "server.ts";
  let content = read(file);
  const original = content;
  const oldImport = 'import { createAgentFlowToolConsentRequest } from "./tool-consent-agent-flow";';
  const newImport = 'import { createAgentFlowToolConsentRequest, getAgentFlowToolConsentRequest } from "./tool-consent-agent-flow";';
  if (content.includes(oldImport) && !content.includes(newImport)) content = content.replace(oldImport, newImport);
  if (!content.includes("consentRequestId?: string;")) {
    content = content.replace("  allowCloudForSensitive?: boolean;\n}", "  allowCloudForSensitive?: boolean;\n  consentRequestId?: string;\n}");
  }
  if (!content.includes("consentRequestId: typeof body.consentRequestId")) {
    content = content.replace(
      "    allowCloudForSensitive: body.allowCloudForSensitive === true,\n  };",
      "    allowCloudForSensitive: body.allowCloudForSensitive === true,\n    consentRequestId: typeof body.consentRequestId === \"string\" ? body.consentRequestId : undefined,\n  };"
    );
  }
  if (!content.includes("PHASE 11.3: Approved Consent Resume Gate")) {
    const marker = "  // PHASE 11.2: Agent Flow Consent Request Gate\n";
    if (!content.includes(marker)) throw new Error("Phase 11.2 Consent Gate Marker in server.ts nicht gefunden.");
    const insert = `  // PHASE 11.3: Approved Consent Resume Gate\n  const phase113ConsentToolId =\n    toolEnforcement.confirmationRequiredToolIds?.[0] ??\n    toolPreflight.candidateToolIds?.[0] ??\n    "unknown-tool";\n  const phase113ConsentRequest = body.consentRequestId\n    ? getAgentFlowToolConsentRequest(body.consentRequestId)\n    : null;\n  const approvedToolConsent =\n    toolEnforcement.consentRequired === true &&\n    Boolean(phase113ConsentRequest) &&\n    phase113ConsentRequest?.status === "approved" &&\n    phase113ConsentRequest?.toolId === phase113ConsentToolId;\n\n  if (toolEnforcement.consentRequired && body.consentRequestId && !approvedToolConsent) {\n    const consentUrl = "/tool-consent?requestId=" + encodeURIComponent(body.consentRequestId);\n    const status = phase113ConsentRequest?.status ?? "missing";\n    const payload = {\n      ok: true,\n      mode: "cloud",\n      sensitivity: body.sensitivity ?? "internal",\n      processingMode: body.processingMode ?? "auto",\n      processingPath,\n      redacted: processingPath === "cloud_redacted",\n      result: {\n        answer: "Die Tool-Ausführung bleibt gesperrt, weil der Consent Request nicht approved ist.",\n        consentRequired: true,\n        consentRequestId: body.consentRequestId,\n        consentUrl,\n        toolId: phase113ConsentToolId,\n        status,\n        toolPreflight,\n        toolEnforcement,\n        toolConsent: {\n          required: true,\n          approved: false,\n          source: "agent-flow-resume",\n          requestId: body.consentRequestId,\n          url: consentUrl,\n          status,\n          toolId: phase113ConsentToolId,\n        },\n      },\n    };\n    sendJson(res, 200, payload);\n    return;\n  }\n\n`;
    content = content.replace(marker, insert + marker);
  }
  content = content.replace(
    "  if (toolEnforcement.consentRequired) {",
    "  if (toolEnforcement.consentRequired && !approvedToolConsent) {"
  );
  if (content.includes("const consentToolId =\n      toolEnforcement.confirmationRequiredToolIds?.[0] ??") && !content.includes("const consentToolId = phase113ConsentToolId;")) {
    content = content.replace(
      /    const consentToolId =\n      toolEnforcement\.confirmationRequiredToolIds\?\.\[0\] \?\?\n      toolPreflight\.candidateToolIds\?\.\[0\] \?\?\n      "unknown-tool";\n/,
      "    const consentToolId = phase113ConsentToolId;\n"
    );
  }
  if (!content.includes("approvedToolConsent ?")) {
    content = content.replace(
      "      toolEnforcement,\n    };",
      "      toolEnforcement,\n      toolConsent: approvedToolConsent ? {\n        required: true,\n        approved: true,\n        source: \"agent-flow-resume\",\n        requestId: phase113ConsentRequest?.id,\n        status: phase113ConsentRequest?.status,\n        toolId: phase113ConsentRequest?.toolId,\n      } : undefined,\n    };"
    );
  }
  if (content !== original) {
    write(file, content);
    console.log("OK server.ts: Consent Resume / Approved Execution Gate ergänzt.");
  } else {
    console.log("SKIP server.ts: Phase 11.3 bereits vorhanden.");
  }
}
function patchFrontendNotice(){
  const file = "frontend/components/AgentFlowConsentRequestPanel.tsx";
  if (!exists(file)) { console.log("SKIP AgentFlowConsentRequestPanel fehlt; Phase 11.2 UI nicht gefunden."); return; }
  let content = read(file);
  if (!content.includes("Phase 11.3 Resume")) {
    content = content.replace(
      "      {consentUrl ? (\n        <a className=\"nav-link\" href={String(consentUrl)}>Consent Request öffnen</a>\n      ) : null}",
      "      {consentUrl ? (\n        <a className=\"nav-link\" href={String(consentUrl)}>Consent Request öffnen</a>\n      ) : null}\n      <p className=\"helper-text\" style={{ marginTop: 10 }}>\n        Phase 11.3 Resume: Nach Genehmigung kann derselbe Agent Request mit dieser Consent Request ID erneut gesendet werden.\n      </p>"
    );
    write(file, content);
    console.log("OK AgentFlowConsentRequestPanel: Resume-Hinweis ergänzt.");
  } else {
    console.log("SKIP AgentFlowConsentRequestPanel: Resume-Hinweis bereits vorhanden.");
  }
}
function patchDocs(){
  const md = `# Phase 11.3 – Consent Resume / Approved Tool Execution\n\n## Ziel\nPhase 11.3 ergänzt den Resume-Pfad: Wenn ein Consent Request approved ist, darf derselbe Agent Flow mit \`consentRequestId\` fortgesetzt werden. Pending, denied, expired oder unbekannte Requests bleiben blockiert.\n\n## Umsetzung\n- \`tool-consent-agent-flow.ts\` erhält Lesefunktionen für Consent Requests.\n- \`server.ts\` akzeptiert optional \`consentRequestId\` im \`/v1/ask\` Body.\n- Bei \`consentRequired\` gilt:\n  - kein \`consentRequestId\`: neuer Pending Request wie Phase 11.2\n  - \`pending/denied/expired/missing\`: Ausführung bleibt gesperrt\n  - \`approved\` und Tool-ID passt: Agent Flow läuft weiter\n- UI bekommt einen Resume-Hinweis im Consent Request Panel.\n\n## Grenze\nAutomatisches Wiederaufnehmen direkt aus der \`/tool-consent\` Seite ist noch nicht enthalten. Das wäre eine spätere Komfort-Erweiterung.\n`;
  if (!exists("phase11-3-consent-resume-approved-tool-execution.md")) write("phase11-3-consent-resume-approved-tool-execution.md", md);
  const runbook = `# Runbook – Phase 11.3 Consent Resume / Approved Tool Execution\n\n## Patch\n\`\`\`powershell\nnpm run phase11:3:patch\n\`\`\`\n\nFalls Script noch nicht registriert ist:\n\`\`\`powershell\nnode scripts/phase11-3-patch-consent-resume-approved-execution.cjs\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase11:3:verify\nnpm run phase11:2:verify\nnpm run tools:consent:verify\nnpm run build\nnpm run stack:health\n\`\`\`\n\n## Manuelle Prüfung\n1. Anfrage auslösen, die Consent erfordert.\n2. \`consentRequestId\` aus Response kopieren.\n3. Request unter \`/tool-consent\` genehmigen.\n4. Dieselbe Anfrage mit \`consentRequestId\` erneut gegen \`/v1/ask\` senden.\n5. Erwartung: Bei approved läuft der Agent Flow weiter; bei pending/denied/expired bleibt er blockiert.\n`;
  if (!exists("docs/phase11-consent-resume-approved-tool-execution-runbook.md")) write("docs/phase11-consent-resume-approved-tool-execution-runbook.md", runbook);
  console.log("OK Docs: Phase 11.3 Doku/Runbook vorhanden.");
}
patchPackage();
patchConsentHelper();
patchServer();
patchFrontendNotice();
patchDocs();
console.log("Phase 11.3 Patch abgeschlossen.");
