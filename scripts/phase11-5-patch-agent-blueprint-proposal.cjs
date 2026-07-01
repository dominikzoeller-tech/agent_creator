const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return fs.readFileSync(full(file), "utf8"); }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); }
function ensureFile(file, content){ if(!exists(file)){ write(file, content); console.log("OK " + file + ": erstellt."); } else { console.log("SKIP " + file + ": existiert bereits."); } }
function patchPackage(){
  const file="package.json";
  const pkg=JSON.parse(read(file));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase11:5:patch"]="node scripts/phase11-5-patch-agent-blueprint-proposal.cjs";
  pkg.scripts["phase11:5:verify"]="node scripts/phase11-5-verify-agent-blueprint-proposal.cjs";
  pkg.scripts["agents:blueprints:verify"]="node scripts/phase11-5-verify-agent-blueprint-proposal.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 11.5 Scripts eingetragen.");
}
const rootHelper = `import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type AgentBlueprintProposalStatus = "draft" | "pending_review" | "approved" | "denied" | "activated";

export interface AgentBlueprintProposal {
  id: string;
  status: AgentBlueprintProposalStatus;
  agentName: string;
  purpose: string;
  source: "agent-flow" | "manual-ui" | "capability-request";
  capabilityRequestId?: string;
  requestedCapability?: string;
  proposedTools: string[];
  proposedPermissions: string[];
  riskLevel: "low" | "medium" | "high";
  requiresConsent: boolean;
  createdAt: string;
  decidedAt?: string;
  decisionNote?: string;
  metadata?: Record<string, unknown>;
}

function getDataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "data");
}
function getFilePath(): string {
  return path.join(getDataDir(), "agent-blueprint-proposals.json");
}
function ensureStore(): void {
  mkdirSync(getDataDir(), { recursive: true });
  try { readFileSync(getFilePath(), "utf8"); } catch { writeFileSync(getFilePath(), "[]\\n", "utf8"); }
}
function readProposals(): AgentBlueprintProposal[] {
  ensureStore();
  try {
    const parsed = JSON.parse(readFileSync(getFilePath(), "utf8")) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is AgentBlueprintProposal => Boolean(entry && typeof entry === "object" && typeof (entry as AgentBlueprintProposal).id === "string")) : [];
  } catch { return []; }
}
function writeProposals(proposals: AgentBlueprintProposal[]): void {
  ensureStore();
  writeFileSync(getFilePath(), JSON.stringify(proposals, null, 2) + "\\n", "utf8");
}
function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9äöüß_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "agent-blueprint";
}
function buildId(agentName: string, timestamp: string): string {
  return "blueprint-" + slug(agentName) + "-" + timestamp.replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8);
}
function inferNameFromCapability(capability: string): string {
  const compact = capability.toLowerCase();
  if (compact.includes("outlook") || compact.includes("mail") || compact.includes("calendar")) return "OutlookWorkflowAgent";
  if (compact.includes("market") || compact.includes("portfolio") || compact.includes("broker")) return "MarketPortfolioAnalysisAgent";
  if (compact.includes("blueprint") || compact.includes("agent")) return "AgentBlueprintPlanningAgent";
  return "CustomCapabilityAgent";
}
function inferToolsFromCapability(capability: string): string[] {
  const compact = capability.toLowerCase();
  if (compact.includes("outlook") || compact.includes("mail") || compact.includes("calendar")) return ["outlook-mail-read", "outlook-calendar-read", "draft-response-generator"];
  if (compact.includes("market") || compact.includes("portfolio") || compact.includes("broker")) return ["market-data-reader", "portfolio-analyzer", "risk-calculator"];
  return ["capability-analyzer", "report-generator"];
}
function inferPermissionsFromCapability(capability: string): string[] {
  const compact = capability.toLowerCase();
  if (compact.includes("outlook") || compact.includes("mail") || compact.includes("calendar")) return ["read_mail_metadata", "read_calendar_metadata", "create_drafts_after_consent"];
  if (compact.includes("market") || compact.includes("portfolio") || compact.includes("broker")) return ["read_uploaded_files", "read_market_data", "create_reports"];
  return ["read_context", "create_blueprint_report"];
}
function inferRiskFromCapability(capability: string): "low" | "medium" | "high" {
  return /outlook|mail|email|calendar|broker|portfolio|write|send|delete|löschen|senden/i.test(capability) ? "high" : "medium";
}
export function inferAgentBlueprintProposal(input: { userInput?: string; requestedCapability?: string; capabilityRequestId?: string }): { shouldCreate: boolean; requestedCapability: string; reason: string } {
  const text = String(input.userInput || "");
  const capability = String(input.requestedCapability || "").trim();
  const wantsBlueprint = /(blueprint|agent[- ]?blueprint|agent vorschlag|agent proposal|spezialagent|agent planen|agent entwerfen)/i.test(text);
  if (!wantsBlueprint && !capability) return { shouldCreate: false, requestedCapability: "", reason: "Kein Agent Blueprint Proposal angefragt." };
  return { shouldCreate: true, requestedCapability: capability || "custom-tool-capability", reason: "Kontrollierter Agent Blueprint Proposal Flow. Es wird nur ein Vorschlag erzeugt, kein Agent aktiviert." };
}
export function createAgentBlueprintProposal(input: { requestedCapability: string; capabilityRequestId?: string; userInput?: string; source?: "agent-flow" | "manual-ui" | "capability-request"; metadata?: Record<string, unknown>; }): AgentBlueprintProposal {
  const now = new Date().toISOString();
  const requestedCapability = input.requestedCapability.trim() || "custom-tool-capability";
  const agentName = inferNameFromCapability(requestedCapability);
  const proposal: AgentBlueprintProposal = {
    id: buildId(agentName, now),
    status: "pending_review",
    agentName,
    purpose: "Vorgeschlagener Spezialagent für Capability: " + requestedCapability + ". Der Blueprint dient nur der Prüfung und aktiviert keine Ausführung.",
    source: input.source || "agent-flow",
    capabilityRequestId: input.capabilityRequestId,
    requestedCapability,
    proposedTools: inferToolsFromCapability(requestedCapability),
    proposedPermissions: inferPermissionsFromCapability(requestedCapability),
    riskLevel: inferRiskFromCapability(requestedCapability),
    requiresConsent: true,
    createdAt: now,
    metadata: { ...(input.metadata || {}), source: input.source || "agent-flow" },
  };
  writeProposals([proposal, ...readProposals()]);
  return proposal;
}
`;
const frontendStore = `import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
export type AgentBlueprintProposalStatus = "draft" | "pending_review" | "approved" | "denied" | "activated";
export interface AgentBlueprintProposal { id:string; status:AgentBlueprintProposalStatus; agentName:string; purpose:string; source?:string; capabilityRequestId?:string; requestedCapability?:string; proposedTools:string[]; proposedPermissions:string[]; riskLevel:"low"|"medium"|"high"; requiresConsent:boolean; createdAt:string; decidedAt?:string; decisionNote?:string; metadata?:Record<string, unknown>; }
function dataDir(){ return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function filePath(){ return path.join(dataDir(), "agent-blueprint-proposals.json"); }
function ensureStore(){ mkdirSync(dataDir(), { recursive:true }); try{ readFileSync(filePath(), "utf8"); } catch { writeFileSync(filePath(), "[]\\n", "utf8"); } }
function readProposals(): AgentBlueprintProposal[]{ ensureStore(); try{ const parsed=JSON.parse(readFileSync(filePath(), "utf8")); return Array.isArray(parsed) ? parsed.filter((entry:any)=>entry && typeof entry.id === "string") : []; } catch { return []; } }
function writeProposals(proposals: AgentBlueprintProposal[]){ ensureStore(); writeFileSync(filePath(), JSON.stringify(proposals, null, 2) + "\\n", "utf8"); }
function slug(value:string){ return value.toLowerCase().replace(/[^a-z0-9äöüß_-]+/g, "-").replace(/^-|-$/g, "").slice(0,50) || "agent-blueprint"; }
function idFor(agentName:string){ const now=new Date().toISOString(); return "blueprint-" + slug(agentName) + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
function normalizeList(value: unknown): string[]{ if(Array.isArray(value)) return value.filter((item): item is string => typeof item === "string").map((item)=>item.trim()).filter(Boolean); if(typeof value === "string") return value.split(",").map((item)=>item.trim()).filter(Boolean); return []; }
export function listAgentBlueprintProposals(){ const proposals=readProposals().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))); const counts=proposals.reduce((acc,p)=>{ acc.total++; acc[p.status]=(acc[p.status]||0)+1; return acc; }, { total:0, draft:0, pending_review:0, approved:0, denied:0, activated:0 } as Record<string, number>); return { ok:true, counts, proposals }; }
export function createAgentBlueprintProposal(input: { agentName:string; purpose:string; requestedCapability?:string; capabilityRequestId?:string; proposedTools?:unknown; proposedPermissions?:unknown; riskLevel?:"low"|"medium"|"high"; source?:string; metadata?:Record<string, unknown>; }){ const now=new Date().toISOString(); const agentName=input.agentName.trim(); if(!agentName) throw new Error("agentName ist erforderlich."); const purpose=input.purpose.trim(); if(!purpose) throw new Error("purpose ist erforderlich."); const proposal: AgentBlueprintProposal = { id:idFor(agentName), status:"pending_review", agentName, purpose, source: input.source || "manual-ui", capabilityRequestId: input.capabilityRequestId, requestedCapability: input.requestedCapability, proposedTools: normalizeList(input.proposedTools), proposedPermissions: normalizeList(input.proposedPermissions), riskLevel: input.riskLevel || "medium", requiresConsent:true, createdAt:now, metadata: input.metadata }; writeProposals([proposal, ...readProposals()]); return proposal; }
export function decideAgentBlueprintProposal(input: { id:string; status:"approved"|"denied"|"activated"; decisionNote?:string }){ const proposals=readProposals(); const index=proposals.findIndex((p)=>p.id===input.id); if(index<0) return null; proposals[index] = { ...proposals[index], status: input.status, decidedAt: new Date().toISOString(), decisionNote: typeof input.decisionNote === "string" ? input.decisionNote.slice(0,500) : undefined }; writeProposals(proposals); return proposals[index]; }
`;
const apiRoute = `import { createAgentBlueprintProposal, decideAgentBlueprintProposal, listAgentBlueprintProposals } from "../../../lib/agent-blueprint-proposal-store";
export const dynamic = "force-dynamic";
export async function GET(){ try{ return Response.json(listAgentBlueprintProposals()); } catch(error){ const message = error instanceof Error ? error.message : "Agent Blueprint Proposals konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
export async function POST(request: Request){ try{ const body = await request.json(); const created = createAgentBlueprintProposal({ agentName: typeof body.agentName === "string" ? body.agentName : "", purpose: typeof body.purpose === "string" ? body.purpose : "", requestedCapability: typeof body.requestedCapability === "string" ? body.requestedCapability : undefined, capabilityRequestId: typeof body.capabilityRequestId === "string" ? body.capabilityRequestId : undefined, proposedTools: body.proposedTools, proposedPermissions: body.proposedPermissions, riskLevel: body.riskLevel === "low" || body.riskLevel === "medium" || body.riskLevel === "high" ? body.riskLevel : undefined, source: typeof body.source === "string" ? body.source : "manual-ui", metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined }); return Response.json({ ok:true, proposal: created }); } catch(error){ const message = error instanceof Error ? error.message : "Agent Blueprint Proposal konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); } }
export async function PATCH(request: Request){ try{ const body = await request.json(); const id = typeof body.id === "string" ? body.id : ""; const status = body.status === "approved" || body.status === "denied" || body.status === "activated" ? body.status : null; if(!id || !status) return Response.json({ ok:false, error:"id und status approved/denied/activated sind erforderlich." }, { status:400 }); const updated = decideAgentBlueprintProposal({ id, status, decisionNote: typeof body.decisionNote === "string" ? body.decisionNote : undefined }); if(!updated) return Response.json({ ok:false, error:"Agent Blueprint Proposal nicht gefunden." }, { status:404 }); return Response.json({ ok:true, proposal: updated }); } catch(error){ const message = error instanceof Error ? error.message : "Agent Blueprint Proposal konnte nicht entschieden werden."; return Response.json({ ok:false, error:message }, { status:500 }); } }
`;
const panel = `"use client";
type Props = { response: unknown };
function asRecord(value: unknown): Record<string, any> | null { return typeof value === "object" && value !== null ? value as Record<string, any> : null; }
export function AgentBlueprintProposalPanel({ response }: Props){
  const root=asRecord(response); const result=asRecord(root?.result); const proposal=asRecord(result?.agentBlueprintProposal);
  const id=result?.agentBlueprintProposalId || proposal?.id; const url=result?.agentBlueprintProposalUrl || proposal?.url; const agentName=result?.agentName || proposal?.agentName; const status=result?.status || proposal?.status; const risk=result?.riskLevel || proposal?.riskLevel;
  if(!id && !agentName) return null;
  return <section className="panel-card" style={{ borderColor:"#a78bfa", background:"#f5f3ff" }}>
    <h2 style={{ marginTop: 0 }}>Agent Blueprint Proposal</h2>
    <p style={{ margin:"8px 0", lineHeight:1.55 }}>Der Agent hat einen kontrollierten Blueprint-Vorschlag erstellt. Es wurde kein Agent automatisch aktiviert.</p>
    <ul style={{ margin:"8px 0 12px", paddingLeft:20 }}>
      {agentName ? <li><strong>Agent:</strong> {String(agentName)}</li> : null}
      {id ? <li><strong>Proposal ID:</strong> <code>{String(id)}</code></li> : null}
      {status ? <li><strong>Status:</strong> {String(status)}</li> : null}
      {risk ? <li><strong>Risk:</strong> {String(risk)}</li> : null}
    </ul>
    {url ? <a className="nav-link" href={String(url)}>Agent Blueprint öffnen</a> : null}
  </section>;
}
`;
const page = `"use client";
import { useEffect, useState } from "react";
type Proposal = { id:string; status:string; agentName:string; purpose:string; requestedCapability?:string; proposedTools?:string[]; proposedPermissions?:string[]; riskLevel?:string; createdAt:string };
export default function AgentBlueprintsPage(){
  const [proposals,setProposals]=useState<Proposal[]>([]); const [error,setError]=useState<string|null>(null);
  const [agentName,setAgentName]=useState("CustomCapabilityAgent"); const [purpose,setPurpose]=useState("Kontrollierter Spezialagent als Blueprint-Vorschlag."); const [capability,setCapability]=useState("custom-tool-capability");
  async function load(){ setError(null); try{ const res=await fetch("/api/agent-blueprints", { cache:"no-store" }); const payload=await res.json(); if(!res.ok) throw new Error(payload?.error || "Fehler"); setProposals(Array.isArray(payload.proposals) ? payload.proposals : []); } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); } }
  useEffect(()=>{ load(); }, []);
  async function create(){ const res=await fetch("/api/agent-blueprints", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ agentName, purpose, requestedCapability: capability, proposedTools:["capability-analyzer", "report-generator"], proposedPermissions:["read_context", "create_blueprint_report"], riskLevel:"medium" }) }); if(!res.ok){ const p=await res.json(); setError(p?.error || "Create fehlgeschlagen"); } await load(); }
  async function decide(id:string,status:"approved"|"denied"|"activated"){ const res=await fetch("/api/agent-blueprints", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, status, decisionNote:"UI decision: " + status }) }); if(!res.ok){ const p=await res.json(); setError(p?.error || "Decision fehlgeschlagen"); } await load(); }
  return <main className="page-wrap"><nav style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:18 }}><a className="nav-link" href="/">Chat</a><a className="nav-link" href="/capability-requests">Capability Requests</a><a className="nav-link" href="/agent-blueprints">Agent Blueprints</a><a className="nav-link" href="/tool-consent">Tool Consent</a><a className="nav-link" href="/analytics">Analytics</a><a className="nav-link" href="/system">System</a></nav><div className="page-shell"><section className="hero-card" style={{ background:"linear-gradient(135deg,#ede9fe 0%,#f8fafc 100%)", borderColor:"#c4b5fd" }}><h1 className="section-title">Agent Blueprint Proposals</h1><p style={{ lineHeight:1.6 }}>Hier werden kontrollierte Agent-Blueprints geprüft. Approval ist nur Freigabe für Planung/Review. Aktivierung bleibt ein separater Governance-Schritt.</p></section>{error ? <section className="panel-card" style={{ borderColor:"#fecaca", background:"#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Blueprint Proposal erstellen</h2><input className="text-input" value={agentName} onChange={(e)=>setAgentName(e.target.value)} /><input className="text-input" value={capability} onChange={(e)=>setCapability(e.target.value)} /><textarea className="text-area" value={purpose} onChange={(e)=>setPurpose(e.target.value)} /><button className="primary-button" type="button" onClick={create}>Agent Blueprint erstellen</button></section><section className="panel-card"><h2>Proposals</h2>{proposals.length===0 ? <p>Noch keine Agent Blueprint Proposals.</p> : proposals.map((p)=><article key={p.id} style={{ borderTop:"1px solid #e5e7eb", padding:"12px 0" }}><div><strong>{p.agentName}</strong> <span className="chip">{p.status}</span> {p.riskLevel ? <span className="chip">{p.riskLevel}</span> : null}</div><div className="helper-text"><code>{p.id}</code> · {p.createdAt}</div><p>{p.purpose}</p>{p.requestedCapability ? <p><strong>Capability:</strong> {p.requestedCapability}</p> : null}{p.proposedTools?.length ? <p><strong>Tools:</strong> {p.proposedTools.join(", ")}</p> : null}{p.proposedPermissions?.length ? <p><strong>Permissions:</strong> {p.proposedPermissions.join(", ")}</p> : null}{p.status === "pending_review" || p.status === "draft" ? <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}><button className="secondary-button" onClick={()=>decide(p.id,"approved")}>Approve</button><button className="secondary-button" onClick={()=>decide(p.id,"denied")}>Deny</button><button className="secondary-button" onClick={()=>decide(p.id,"activated")}>Activated</button></div> : null}</article>)}</section></div></main>;
}
`;
function patchDockerfile(){ const file="Dockerfile"; if(!exists(file)) return; let content=read(file); if(!content.includes("COPY agent-blueprint-proposal-agent-flow.ts ./")){ const marker="COPY tool-capability-request-agent-flow.ts ./\n"; content = content.includes(marker) ? content.replace(marker, marker+"COPY agent-blueprint-proposal-agent-flow.ts ./\n") : content + "\nCOPY agent-blueprint-proposal-agent-flow.ts ./\n"; write(file, content); console.log("OK Dockerfile: Agent Blueprint Helper aufgenommen."); } else console.log("SKIP Dockerfile: Agent Blueprint Helper bereits vorhanden."); }
function patchServer(){
  const file="server.ts"; let content=read(file); const original=content;
  const importLine='import { createAgentBlueprintProposal, inferAgentBlueprintProposal } from "./agent-blueprint-proposal-agent-flow";';
  if(!content.includes(importLine)){
    const marker='import { createAgentFlowCapabilityRequest, inferMissingCapabilityRequest } from "./tool-capability-request-agent-flow";';
    if(content.includes(marker)) content=content.replace(marker, marker+"\n"+importLine);
    else content=content.replace(/import \{ createAgentFlowCapabilityRequest[^\n]+\n/, m=>m+importLine+"\n");
  }
  if(!content.includes("PHASE 11.5: Agent Blueprint Proposal Flow")){
    const marker="  // PHASE 11.4: Missing Tool / Capability Request Flow\n";
    if(!content.includes(marker)) throw new Error("Phase 11.4 Marker in server.ts nicht gefunden.");
    const block=`  // PHASE 11.5: Agent Blueprint Proposal Flow
  const blueprintIntent = inferAgentBlueprintProposal({ userInput: effectiveUserInput });
  if (blueprintIntent.shouldCreate) {
    const proposal = createAgentBlueprintProposal({
      requestedCapability: blueprintIntent.requestedCapability,
      userInput: body.userInput,
      source: "agent-flow",
      metadata: { source: "agent-flow", blueprintIntent, toolPreflight, toolEnforcement },
    });
    const agentBlueprintProposalUrl = "/agent-blueprints?proposalId=" + encodeURIComponent(proposal.id);
    const payload = {
      ok: true,
      mode: "cloud",
      sensitivity: body.sensitivity ?? "internal",
      processingMode: body.processingMode ?? "auto",
      processingPath,
      redacted: processingPath === "cloud_redacted",
      result: {
        answer: "Es wurde ein kontrollierter Agent Blueprint Proposal erstellt. Der Agent wird nicht automatisch aktiviert.",
        agentBlueprintProposalCreated: true,
        agentBlueprintProposalId: proposal.id,
        agentBlueprintProposalUrl,
        agentName: proposal.agentName,
        status: proposal.status,
        riskLevel: proposal.riskLevel,
        requestedCapability: proposal.requestedCapability,
        proposedTools: proposal.proposedTools,
        proposedPermissions: proposal.proposedPermissions,
        toolPreflight,
        toolEnforcement,
        agentBlueprintProposal: {
          id: proposal.id,
          url: agentBlueprintProposalUrl,
          agentName: proposal.agentName,
          status: proposal.status,
          riskLevel: proposal.riskLevel,
          source: "agent-flow",
        },
      },
    };
    await appendDecisionLog({
      timestamp: new Date().toISOString(),
      route: "direct",
      userInput: body.userInput,
      recommendation: null,
      firstStep: "Agent Blueprint Proposal erstellt: " + agentBlueprintProposalUrl,
      confidence: null,
      context: body.context ?? [],
      extractedOptions: [],
      suggestedAgents: [proposal.agentName],
      routingSummary: "Agent Blueprint Proposal | Agent Flow | " + proposal.agentName,
      routingDetails: undefined,
      toolPreflight,
      toolEnforcement,
      agentBlueprintProposalCreated: true,
      agentBlueprintProposalId: proposal.id,
      agentBlueprintProposalUrl,
    } as any);
    sendJson(res, 200, payload);
    return;
  }

`;
    content=content.replace(marker, block+marker);
  }
  if(content!==original){ write(file, content); console.log("OK server.ts: Agent Blueprint Proposal Flow ergänzt."); } else console.log("SKIP server.ts: Agent Blueprint Proposal Flow bereits vorhanden.");
}
function patchFrontend(){
  ensureFile("frontend/lib/agent-blueprint-proposal-store.ts", frontendStore);
  ensureFile("frontend/app/api/agent-blueprints/route.ts", apiRoute);
  ensureFile("frontend/components/AgentBlueprintProposalPanel.tsx", panel);
  ensureFile("frontend/app/agent-blueprints/page.tsx", page);
  const file="frontend/app/page.tsx"; if(!exists(file)) return;
  let content=read(file); const original=content;
  const imp='import { AgentBlueprintProposalPanel } from "../components/AgentBlueprintProposalPanel";';
  if(!content.includes(imp)){ const lines=content.split(/\r?\n/); let last=-1; for(let i=0;i<lines.length;i++) if(lines[i].startsWith("import ")) last=i; if(last>=0){ lines.splice(last+1,0,imp); content=lines.join("\n"); } }
  if(!content.includes("<AgentBlueprintProposalPanel response={response} />")){
    const line="                <AgentBlueprintProposalPanel response={response} />";
    if(content.includes("<MissingCapabilityRequestPanel response={response} />")) content=content.replace(/(\s*<MissingCapabilityRequestPanel response=\{response\} \/>\s*)/, "$1"+line+"\n");
    else { const mainClose=content.lastIndexOf("</main>"); if(mainClose>=0) content=content.slice(0,mainClose)+line+"\n"+content.slice(mainClose); }
  }
  if(!content.includes('href="/agent-blueprints"')){
    if(content.includes('href="/capability-requests"')) content=content.replace(/(<a className="nav-link" href="\/capability-requests">[^<]+<\/a>)/, '$1\n        <a className="nav-link" href="/agent-blueprints">Agent Blueprints</a>');
  }
  if(content!==original){ write(file, content); console.log("OK frontend/app/page.tsx: AgentBlueprintProposalPanel/Navigation ergänzt."); } else console.log("SKIP frontend/app/page.tsx: bereits vorbereitet.");
}
function patchDocs(){
  ensureFile("phase11-5-agent-blueprint-proposal.md", "# Phase 11.5 – Agent Blueprint Proposal\n\n## Ziel\nAus einem Capability-Kontext kann ein kontrollierter Agent Blueprint Proposal entstehen. Der Proposal enthält Agent-Name, Zweck, vorgeschlagene Tools, vorgeschlagene Permissions, Risk Level und Consent-Anforderung.\n\n## Wichtig\nEs wird kein Agent automatisch aktiviert und kein Tool automatisch gebaut. Approval ist nur Review-/Planungsfreigabe. Aktivierung bleibt späterer separater Governance-Schritt.\n\n## Flow\n1. Agent Flow erkennt Blueprint-Intent.\n2. Proposal wird mit Status pending_review gespeichert.\n3. Response enthält agentBlueprintProposalId und agentBlueprintProposalUrl.\n4. UI zeigt Link auf /agent-blueprints?proposalId=<id>.\n5. Admin/User kann approve, deny oder activated setzen.\n");
  ensureFile("docs/phase11-agent-blueprint-proposal-runbook.md", "# Runbook – Phase 11.5 Agent Blueprint Proposal\n\n## Patch\n```powershell\nnpm run phase11:5:patch\n```\n\nFalls Script noch nicht registriert ist:\n```powershell\nnode scripts/phase11-5-patch-agent-blueprint-proposal.cjs\n```\n\n## Verify\n```powershell\nnpm run phase11:5:verify\nnpm run build\nnpm run stack:health\n```\n\n## Manuelle Prüfung\n1. Chat öffnen.\n2. Eingeben: Bitte erstelle einen Agent Blueprint für outlook-mail-calendar-capability.\n3. Erwartung: Response enthält agentBlueprintProposalId und agentBlueprintProposalUrl.\n4. /agent-blueprints öffnen und Proposal prüfen.\n");
}
patchPackage();
ensureFile("agent-blueprint-proposal-agent-flow.ts", rootHelper);
patchDockerfile();
patchServer();
patchFrontend();
patchDocs();
console.log("Phase 11.5 Patch abgeschlossen.");
