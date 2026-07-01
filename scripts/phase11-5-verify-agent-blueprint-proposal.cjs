const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 11.5 Agent Blueprint Verify"); console.log("======================================");
let ok=true;
ok = check("agent-blueprint-proposal-agent-flow.ts", ["createAgentBlueprintProposal", "inferAgentBlueprintProposal", "agent-blueprint-proposals.json", "pending_review"]) && ok;
ok = check("server.ts", ["PHASE 11.5: Agent Blueprint Proposal Flow", "inferAgentBlueprintProposal", "createAgentBlueprintProposal", "agentBlueprintProposalId", "/agent-blueprints?proposalId="]) && ok;
ok = check("frontend/lib/agent-blueprint-proposal-store.ts", ["listAgentBlueprintProposals", "createAgentBlueprintProposal", "decideAgentBlueprintProposal", "activated"]) && ok;
ok = check("frontend/app/api/agent-blueprints/route.ts", ["GET", "POST", "PATCH", "decideAgentBlueprintProposal"]) && ok;
ok = check("frontend/app/agent-blueprints/page.tsx", ["Agent Blueprint Proposals", "Agent Blueprint erstellen", "Activated"]) && ok;
ok = check("frontend/components/AgentBlueprintProposalPanel.tsx", ["AgentBlueprintProposalPanel", "Agent Blueprint öffnen", "kein Agent automatisch aktiviert"]) && ok;
ok = check("frontend/app/page.tsx", ["AgentBlueprintProposalPanel", "<AgentBlueprintProposalPanel response={response} />", "/agent-blueprints"]) && ok;
ok = check("Dockerfile", ["COPY agent-blueprint-proposal-agent-flow.ts ./"]) && ok;
ok = check("phase11-5-agent-blueprint-proposal.md", ["Phase 11.5", "agentBlueprintProposalId", "kein Agent automatisch aktiviert"]) && ok;
ok = check("docs/phase11-agent-blueprint-proposal-runbook.md", ["phase11:5:patch", "phase11:5:verify", "/agent-blueprints"]) && ok;
ok = check("package.json", ["phase11:5:patch", "phase11:5:verify", "agents:blueprints:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 11.5 Agent Blueprint Proposal ist vorbereitet.");
