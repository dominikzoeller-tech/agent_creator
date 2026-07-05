import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type ToolAdapterConsentBindingStatus = "pending" | "approved" | "denied" | "expired";
export interface ToolAdapterConsentBinding {
  id: string;
  toolExecutionPlanId: string;
  consentRequestId: string;
  status: ToolAdapterConsentBindingStatus;
  source: "tool-adapter-sandbox";
  requestedAt: string;
  decidedAt?: string;
  adapterId?: string;
  adapterName?: string;
  requestedAction?: string;
  consentUrl: string;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function bindingPath(): string { return path.join(dataDir(), "tool-adapter-consent-bindings.json"); }
function plansPath(): string { return path.join(dataDir(), "tool-execution-sandbox-plans.jsonl"); }
function consentPath(): string { return path.join(dataDir(), "tool-consent-requests.json"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); try { readFileSync(bindingPath(), "utf8"); } catch { writeFileSync(bindingPath(), "[]\n", "utf8"); } try { readFileSync(consentPath(), "utf8"); } catch { writeFileSync(consentPath(), "[]\n", "utf8"); } }
function readJsonArray(file: string): any[] { try { const parsed=JSON.parse(readFileSync(file,"utf8")); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function writeJsonArray(file: string, value: any[]): void { ensureStore(); writeFileSync(file, JSON.stringify(value,null,2)+"\n", "utf8"); }
function readJsonl(file: string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
export function listToolAdapterConsentBindings(): ToolAdapterConsentBinding[] { ensureStore(); return readJsonArray(bindingPath()).sort((a,b)=>String(b.requestedAt).localeCompare(String(a.requestedAt))); }
export function createToolAdapterConsentBinding(input: { toolExecutionPlanId: string; metadata?: Record<string, unknown> }): ToolAdapterConsentBinding {
  ensureStore();
  const toolExecutionPlanId=input.toolExecutionPlanId.trim();
  if(!toolExecutionPlanId) throw new Error("toolExecutionPlanId ist erforderlich.");
  const plan = readJsonl(plansPath()).find((entry:any)=>entry && entry.id===toolExecutionPlanId);
  if(!plan) throw new Error("Tool Execution Plan nicht gefunden.");
  const now=new Date().toISOString();
  const consentRequestId=makeId("tool-adapter-consent");
  const binding: ToolAdapterConsentBinding={
    id: makeId("tool-adapter-binding"),
    toolExecutionPlanId,
    consentRequestId,
    status:"pending",
    source:"tool-adapter-sandbox",
    requestedAt:now,
    adapterId: plan.adapterId,
    adapterName: plan.adapterName,
    requestedAction: plan.requestedAction,
    consentUrl:"/tool-consent?requestId="+encodeURIComponent(consentRequestId),
    toolExecutionAllowed:false,
    dryRunOnly:true,
    metadata:{ ...(input.metadata||{}), source:"tool-adapter-sandbox", planDecision: plan.decision, toolExecutionAllowed:false, dryRunOnly:true },
  };
  const consentRequest={
    id: consentRequestId,
    status:"pending",
    toolId:"tool-adapter:"+(plan.adapterName||plan.adapterId||"unknown-adapter"),
    toolName:"Controlled Tool Adapter Sandbox",
    reason:"Tool Adapter Consent Binding fÃ¼r Dry-run Tool Execution Plan. Phase 13.1 erlaubt weiterhin keine echte Tool-AusfÃ¼hrung.",
    userInputPreview:String(plan.requestedAction||"tool-adapter-action").slice(0,240),
    sensitivity:"internal",
    processingMode:"local_only",
    requestedAt:now,
    createdAt:now,
    source:"tool-adapter-sandbox",
    metadata:{ toolExecutionPlanId, bindingId:binding.id, dryRunOnly:true, toolExecutionAllowed:false },
  };
  writeJsonArray(consentPath(), [consentRequest, ...readJsonArray(consentPath())]);
  writeJsonArray(bindingPath(), [binding, ...readJsonArray(bindingPath())]);
  return binding;
}
export function syncToolAdapterConsentBindingStatuses(): ToolAdapterConsentBinding[] {
  const consentRequests=readJsonArray(consentPath());
  const bindings=readJsonArray(bindingPath());
  let changed=false;
  const synced=bindings.map((binding:any)=>{
    const request=consentRequests.find((entry:any)=>entry && entry.id===binding.consentRequestId);
    if(!request || request.status===binding.status) return binding;
    changed=true;
    return { ...binding, status: request.status, decidedAt: request.decidedAt || request.updatedAt || binding.decidedAt };
  });
  if(changed) writeJsonArray(bindingPath(), synced);
  return synced.sort((a:any,b:any)=>String(b.requestedAt).localeCompare(String(a.requestedAt)));
}
export function summarizeToolAdapterConsentBindings(bindings: ToolAdapterConsentBinding[]) { const byStatus: Record<string, number>={}; for(const binding of bindings) byStatus[binding.status]=(byStatus[binding.status]||0)+1; return { total: bindings.length, byStatus }; }

