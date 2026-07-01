const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return fs.readFileSync(full(file), "utf8"); }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); }
function ensureFile(file, content){ if(!exists(file)){ write(file, content); console.log(`OK ${file}: erstellt.`); } else { console.log(`SKIP ${file}: existiert bereits.`); } }
function patchPackage(){
  const file="package.json";
  const pkg=JSON.parse(read(file));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase11:2:patch"]="node scripts/phase11-2-patch-agent-flow-consent-request-integration.cjs";
  pkg.scripts["phase11:2:verify"]="node scripts/phase11-2-verify-agent-flow-consent-request-integration.cjs";
  pkg.scripts["tools:consent:flow:verify"]="node scripts/phase11-2-verify-agent-flow-consent-request-integration.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 11.2 Scripts eingetragen.");
}
const helper = `import { mkdirSync, readFileSync, writeFileSync } from "node:fs";\nimport path from "node:path";\n\nexport type AgentFlowToolConsentStatus = "pending" | "approved" | "denied" | "expired";\n\nexport interface AgentFlowToolConsentRequest {\n  id: string;\n  toolId: string;\n  status: AgentFlowToolConsentStatus;\n  reason?: string;\n  userInputPreview?: string;\n  sensitivity?: string;\n  processingMode?: string;\n  requestedAt: string;\n  decidedAt?: string;\n  expiresAt?: string;\n  decisionNote?: string;\n  metadata?: Record<string, unknown>;\n}\n\nfunction getConsentDataDir(): string {\n  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "data");\n}\n\nfunction getConsentFilePath(): string {\n  return path.join(getConsentDataDir(), "tool-consent-requests.json");\n}\n\nfunction ensureStore(): void {\n  mkdirSync(getConsentDataDir(), { recursive: true });\n  const file = getConsentFilePath();\n  try {\n    readFileSync(file, "utf8");\n  } catch {\n    writeFileSync(file, "[]\\n", "utf8");\n  }\n}\n\nfunction sanitizePreview(value: string | undefined): string | undefined {\n  if (!value) return undefined;\n  return value\n    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/gi, "[redacted-email]")\n    .replace(/(api[_-]?key|token|secret|password)\\s*[:=]\\s*[^\\s,;]+/gi, "$1=[redacted]")\n    .slice(0, 240);\n}\n\nfunction readRequests(): AgentFlowToolConsentRequest[] {\n  ensureStore();\n  try {\n    const parsed = JSON.parse(readFileSync(getConsentFilePath(), "utf8")) as unknown;\n    return Array.isArray(parsed) ? parsed.filter((entry): entry is AgentFlowToolConsentRequest => Boolean(entry && typeof entry === "object" && typeof (entry as AgentFlowToolConsentRequest).id === "string")) : [];\n  } catch {\n    return [];\n  }\n}\n\nfunction writeRequests(requests: AgentFlowToolConsentRequest[]): void {\n  ensureStore();\n  writeFileSync(getConsentFilePath(), JSON.stringify(requests, null, 2) + "\\n", "utf8");\n}\n\nfunction buildConsentId(toolId: string, timestamp: string): string {\n  const slug = toolId.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "tool";\n  const compactTime = timestamp.replace(/[^0-9]/g, "").slice(0, 14);\n  const random = Math.random().toString(36).slice(2, 8);\n  return \`consent-\${slug}-\${compactTime}-\${random}\`;\n}\n\nexport function createAgentFlowToolConsentRequest(input: {\n  toolId: string;\n  reason?: string;\n  userInputPreview?: string;\n  sensitivity?: string;\n  processingMode?: string;\n  ttlMinutes?: number;\n  metadata?: Record<string, unknown>;\n}): AgentFlowToolConsentRequest {\n  const now = new Date();\n  const requestedAt = now.toISOString();\n  const ttlMinutes = Number.isFinite(input.ttlMinutes) ? Math.max(1, Math.min(Number(input.ttlMinutes), 24 * 60)) : 60;\n  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000).toISOString();\n  const toolId = input.toolId.trim() || "unknown-tool";\n  const request: AgentFlowToolConsentRequest = {\n    id: buildConsentId(toolId, requestedAt),\n    toolId,\n    status: "pending",\n    reason: input.reason || "Agent Flow fordert explizite Tool-Freigabe an.",\n    userInputPreview: sanitizePreview(input.userInputPreview),\n    sensitivity: input.sensitivity,\n    processingMode: input.processingMode,\n    requestedAt,\n    expiresAt,\n    metadata: { ...(input.metadata || {}), source: "agent-flow" },\n  };\n  const requests = readRequests();\n  writeRequests([request, ...requests]);\n  return request;\n}\n`;
function patchDockerfile(){
  const file="Dockerfile"; if(!exists(file)) return console.log("SKIP Dockerfile nicht gefunden.");
  let content=read(file); const original=content;
  if(!content.includes("COPY tool-consent-agent-flow.ts ./")){
    const marker="COPY tool-enforcement-prep.ts ./\n";
    if(content.includes(marker)) content=content.replace(marker, marker+"COPY tool-consent-agent-flow.ts ./\n");
    else content += "\nCOPY tool-consent-agent-flow.ts ./\n";
  }
  if(content!==original){ write(file,content); console.log("OK Dockerfile: tool-consent-agent-flow.ts aufgenommen."); } else console.log("SKIP Dockerfile: bereits vorbereitet.");
}
function patchDockerCompose(){
  const file="docker-compose.internal.yml"; if(!exists(file)) return console.log("SKIP docker-compose.internal.yml nicht gefunden.");
  let content=read(file); const original=content;
  if(!content.includes("TOOL_CONSENT_DATA_DIR:")){
    content=content.replace(/(environment:\n\s+PORT:\s+7071\n)/, `$1      TOOL_CONSENT_DATA_DIR: /data\n`);
    content=content.replace(/(NEXT_PUBLIC_AGENT_API_BASE_URL:\s+http:\/\/localhost:7071\n)/, `$1      TOOL_CONSENT_DATA_DIR: /data\n`);
  }
  if(!content.includes("./data:/data")){
    content=content.replace(/(\s+- \.\/knowledge:\/app\/knowledge:ro\n)/, `$1      - ./data:/data\n`);
    content=content.replace(/(\s+- \.\/memory:\/memory\n)/, `$1      - ./data:/data\n`);
  }
  if(content!==original){ write(file,content); console.log("OK docker-compose.internal.yml: gemeinsames Consent-Data-Volume ergänzt."); } else console.log("SKIP docker-compose.internal.yml: bereits vorbereitet.");
}
function patchServer(){
  const file="server.ts"; let content=read(file); const original=content;
  const importLine='import { createAgentFlowToolConsentRequest } from "./tool-consent-agent-flow";';
  if(!content.includes(importLine)){
    const marker='import { buildToolEnforcementPrep } from "./tool-enforcement-prep";\n';
    if(!content.includes(marker)) throw new Error("Import-Marker für tool-enforcement-prep in server.ts nicht gefunden.");
    content=content.replace(marker, marker+importLine+"\n");
  }
  if(!content.includes("PHASE 11.2: Agent Flow Consent Request Gate")){
    const marker=`  if (toolEnforcement.hardBlocked) {`;
    const idx=content.indexOf(marker);
    if(idx<0) throw new Error("hardBlocked Gate in server.ts nicht gefunden.");
    const endMarker=`  const memory = await buildProjectMemoryContext(effectiveUserInput, { limit: 5 });`;
    const endIdx=content.indexOf(endMarker, idx);
    if(endIdx<0) throw new Error("Memory-Marker nach hardBlocked Gate in server.ts nicht gefunden.");
    const block=`\n  // PHASE 11.2: Agent Flow Consent Request Gate\n  if (toolEnforcement.consentRequired) {\n    const consentToolId =\n      toolEnforcement.confirmationRequiredToolIds?.[0] ??\n      toolPreflight.candidateToolIds?.[0] ??\n      "unknown-tool";\n    const consentRequest = createAgentFlowToolConsentRequest({\n      toolId: consentToolId,\n      reason: "Agent Flow benötigt explizite Tool-Freigabe, bevor das Tool ausgeführt werden darf.",\n      userInputPreview: body.userInput,\n      sensitivity: body.sensitivity,\n      processingMode: body.processingMode,\n      metadata: {\n        source: "agent-flow",\n        toolEnforcement,\n        candidateToolIds: toolPreflight.candidateToolIds,\n      },\n    });\n    const consentUrl = "/tool-consent?requestId=" + encodeURIComponent(consentRequest.id);\n    const payload = {\n      ok: true,\n      mode: "cloud",\n      sensitivity: body.sensitivity ?? "internal",\n      processingMode: body.processingMode ?? "auto",\n      processingPath,\n      redacted: processingPath === "cloud_redacted",\n      result: {\n        answer: "Für diese Tool-Ausführung ist eine explizite Freigabe erforderlich. Die Ausführung wurde bis zur Entscheidung blockiert.",\n        consentRequired: true,\n        consentRequestCreated: true,\n        consentRequestId: consentRequest.id,\n        consentUrl,\n        toolId: consentRequest.toolId,\n        status: consentRequest.status,\n        toolPreflight,\n        toolEnforcement,\n        toolConsent: {\n          required: true,\n          source: "agent-flow",\n          requestId: consentRequest.id,\n          url: consentUrl,\n          status: consentRequest.status,\n          toolId: consentRequest.toolId,\n        },\n      },\n    };\n    await appendDecisionLog({\n      timestamp: new Date().toISOString(),\n      route: "direct",\n      userInput: body.userInput,\n      recommendation: null,\n      firstStep: "Consent Request erstellt: " + consentUrl,\n      confidence: null,\n      context: body.context ?? [],\n      extractedOptions: [],\n      suggestedAgents: ["privacy_agent"],\n      routingSummary: "Tool Consent Required | Agent Flow | " + consentRequest.toolId,\n      routingDetails: undefined,\n      toolPreflight,\n      toolEnforcement,\n      consentRequestCreated: true,\n      consentRequestId: consentRequest.id,\n      consentUrl,\n      toolConsent: payload.result.toolConsent,\n    } as any);\n    sendJson(res, 200, payload);\n    return;\n  }\n\n`;
    content=content.slice(0,endIdx)+block+content.slice(endIdx);
  }
  if(content!==original){ write(file,content); console.log("OK server.ts: Agent Flow Consent Gate ergänzt."); } else console.log("SKIP server.ts: Phase 11.2 Gate bereits vorhanden.");
}
const panel = `"use client";\n\ntype Props = { response: unknown };\n\nfunction asRecord(value: unknown): Record<string, any> | null {\n  return typeof value === "object" && value !== null ? (value as Record<string, any>) : null;\n}\n\nexport function AgentFlowConsentRequestPanel({ response }: Props) {\n  const root = asRecord(response);\n  const result = asRecord(root?.result);\n  const consent = asRecord(result?.toolConsent);\n  const requestId = result?.consentRequestId || consent?.requestId;\n  const consentUrl = result?.consentUrl || consent?.url;\n  const toolId = result?.toolId || consent?.toolId;\n  const status = result?.status || consent?.status;\n  const required = result?.consentRequired === true || consent?.required === true;\n\n  if (!required && !requestId) return null;\n\n  return (\n    <section className="panel-card" style={{ borderColor: "#f59e0b", background: "#fffbeb" }}>\n      <h2 style={{ marginTop: 0 }}>Consent Request im Agent Flow</h2>\n      <p style={{ margin: "8px 0", lineHeight: 1.55 }}>\n        Die Tool-Ausführung wurde angehalten, bis dieser Consent Request entschieden wurde.\n      </p>\n      <ul style={{ margin: "8px 0 12px", paddingLeft: 20 }}>\n        {toolId ? <li><strong>Tool:</strong> {String(toolId)}</li> : null}\n        {requestId ? <li><strong>Request ID:</strong> <code>{String(requestId)}</code></li> : null}\n        {status ? <li><strong>Status:</strong> {String(status)}</li> : null}\n      </ul>\n      {consentUrl ? (\n        <a className="nav-link" href={String(consentUrl)}>Consent Request öffnen</a>\n      ) : null}\n    </section>\n  );\n}\n`;
function patchFrontend(){
  ensureFile("frontend/components/AgentFlowConsentRequestPanel.tsx", panel);
  const file="frontend/app/page.tsx"; if(!exists(file)) return console.log("SKIP frontend/app/page.tsx nicht gefunden.");
  let content=read(file); const original=content;
  const imp='import { AgentFlowConsentRequestPanel } from "../components/AgentFlowConsentRequestPanel";';
  if(!content.includes(imp)){
    const lines=content.split(/\r?\n/); let last=-1; for(let i=0;i<lines.length;i++){ if(lines[i].startsWith("import ")) last=i; }
    if(last>=0){ lines.splice(last+1,0,imp); content=lines.join("\n"); }
  }
  if(!content.includes("<AgentFlowConsentRequestPanel response={response} />")){
    const line="                <AgentFlowConsentRequestPanel response={response} />";
    if(content.includes("<ToolConsentPanel response={response} />")) content=content.replace(/(\s*<ToolConsentPanel response=\{response\} \/>\s*)/, `$1${line}\n`);
    else if(content.includes("<ToolEnforcementPanel response={response} />")) content=content.replace(/(\s*<ToolEnforcementPanel response=\{response\} \/>\s*)/, `$1${line}\n`);
    else {
      const mainClose=content.lastIndexOf("</main>");
      if(mainClose>=0) content=content.slice(0,mainClose)+line+"\n"+content.slice(mainClose);
    }
  }
  if(content!==original){ write(file,content); console.log("OK frontend/app/page.tsx: AgentFlowConsentRequestPanel eingebunden."); } else console.log("SKIP frontend/app/page.tsx: bereits vorbereitet.");
}
function patchDocs(){
  ensureFile("phase11-2-agent-flow-consent-request-integration.md", `# Phase 11.2 – Consent Request Integration in Agent Flow\n\n## Ziel\nDer Agent Flow erstellt automatisch persistente Consent Requests, wenn Tool Enforcement \`consentRequired\`/\`confirmationRequired\` meldet. Tool-Ausführung bleibt bis zur Approval-Entscheidung gesperrt.\n\n## Änderungen\n- Neuer API-Helfer \`tool-consent-agent-flow.ts\` schreibt Consent Requests in den gemeinsamen Consent Store.\n- \`server.ts\` blockiert Consent-pflichtige Tool-Ausführung vor dem Master-Agent-Lauf und gibt \`consentRequestId\` sowie \`consentUrl\` zurück.\n- Chat UI zeigt einen konkreten Link auf \`/tool-consent?requestId=<id>\`.\n- Dockerfile und Compose erhalten die nötige Datei bzw. ein gemeinsames Consent-Data-Volume.\n\n## Erwarteter Flow\n1. Tool Preflight erkennt kandidatige Tools.\n2. Tool Enforcement markiert Consent-Pflicht.\n3. Agent Flow erzeugt Request mit Status \`pending\`.\n4. Response enthält \`consentRequired: true\`, \`consentRequestId\`, \`consentUrl\`.\n5. Tool wird nicht ausgeführt.\n\n## Grenze\nResume nach Approval ist noch nicht Teil von Phase 11.2. Das folgt in Phase 11.3.\n`);
  ensureFile("docs/phase11-agent-flow-consent-request-integration-runbook.md", `# Runbook – Phase 11.2 Agent Flow Consent Request Integration\n\n## Voraussetzungen\n- Phase 11.0/11.1 vorhanden\n- Stack healthy\n- \`/tool-consent\` funktioniert\n\n## Patch\n\`\`\`powershell\nnpm run phase11:2:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase11:2:verify\nnpm run tools:consent:verify\n\`\`\`\n\n## Build/Health\n\`\`\`powershell\nnpm run build\ndocker compose -f docker-compose.internal.yml ps\nnpm run stack:health\n\`\`\`\n\n## Manuelle Prüfung\n1. Chat öffnen: http://localhost:3000\n2. Anfrage stellen, die ein Consent-pflichtiges Tool triggert.\n3. Erwartung: Tool wird nicht ausgeführt, Response zeigt Consent Request.\n4. Link \`/tool-consent?requestId=<id>\` öffnen.\n5. Request ist als \`pending\` sichtbar und kann genehmigt/abgelehnt werden.\n\n## Troubleshooting\n- Falls Consent Requests nicht sichtbar sind, prüfen ob beide Container \`TOOL_CONSENT_DATA_DIR=/data\` und \`./data:/data\` verwenden.\n- Falls API Build fehlschlägt, Dockerfile prüfen: \`COPY tool-consent-agent-flow.ts ./\`.\n- Falls UI Link fehlt, \`frontend/components/AgentFlowConsentRequestPanel.tsx\` und Einbindung in \`frontend/app/page.tsx\` prüfen.\n\n## Rollback\n- Änderungen aus Git zurücksetzen oder neue Dateien entfernen.\n- Enforcement über ENV wieder auf Dry-Run/Off setzen.\n`);
}
patchPackage();
ensureFile("tool-consent-agent-flow.ts", helper);
patchDockerfile();
patchDockerCompose();
patchServer();
patchFrontend();
patchDocs();
console.log("Phase 11.2 Patch abgeschlossen.");
