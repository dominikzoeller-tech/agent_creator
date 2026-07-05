"use client";

type NavItem = {
  href: string;
  label: string;
  key: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// Phase 14.1 â€“ Navigation Cleanup / Admin Mode Grouping
// Ziel: wenige primÃ¤re Links, technische Seiten gruppiert im Admin/Developer Bereich.
const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/master-cockpit", label: "Master Cockpit", key: "master-cockpit" },
  { href: "/cockpit-actions", label: "Actions", key: "cockpit-actions" },
  { href: "/master-orchestrator", label: "Orchestrator", key: "master-orchestrator" },
  { href: "/master-orchestrator-policy", label: "Orch Policy", key: "master-orchestrator-policy" },
  { href: "/master-orchestrator-dashboard", label: "Orch Dashboard", key: "master-orchestrator-dashboard" },
  { href: "/master-planner", label: "Planner", key: "master-planner" },
  { href: "/master-planner-policy", label: "Planner Policy", key: "master-planner-policy" },
  { href: "/master-planner-dashboard", label: "Planner Dashboard", key: "master-planner-dashboard" },
  { href: "/llm-routing-envelope", label: "LLM Routing", key: "llm-routing-envelope" },
  { href: "/llm-routing-policy", label: "LLM Policy", key: "llm-routing-policy" },
  { href: "/llm-routing-dashboard", label: "LLM Dashboard", key: "llm-routing-dashboard" },
  { href: "/", label: "Chat", key: "chat" },
  { href: "/tool-consent", label: "Approvals", key: "tool-consent" },
  { href: "/governance-audit", label: "Audit", key: "governance-audit" },
  { href: "/approved-real-llm-invocation-envelope", label: "Invocation Envelope", key: "approved-real-llm-invocation-envelope" },
  { href: "/approved-real-llm-invocation-envelope-policy", label: "Envelope Policy", key: "approved-real-llm-invocation-envelope-policy" },
  { href: "/approved-real-llm-invocation-envelope-dashboard", label: "Envelope Dashboard", key: "approved-real-llm-invocation-envelope-dashboard" },
  { href: "/provider-llm-adapter-stub", label: "Provider Stub", key: "provider-llm-adapter-stub" },
  { href: "/provider-llm-adapter-policy", label: "Provider Policy", key: "provider-llm-adapter-policy" },
  { href: "/provider-llm-adapter-dashboard", label: "Provider Dashboard", key: "provider-llm-adapter-dashboard" },
  { href: "/provider-config-secret-boundary", label: "Secret Boundary", key: "provider-config-secret-boundary" },
  { href: "/provider-config-policy", label: "Provider Config Policy", key: "provider-config-policy" },
  { href: "/provider-config-dashboard", label: "Provider Config Dashboard", key: "provider-config-dashboard" },
  { href: "/provider-invocation-readiness-preflight", label: "Provider Readiness", key: "provider-invocation-readiness-preflight" },
  { href: "/provider-readiness-policy", label: "Readiness Policy", key: "provider-readiness-policy" },
  { href: "/provider-readiness-dashboard", label: "Readiness Dashboard", key: "provider-readiness-dashboard" },
  { href: "/controlled-provider-invocation-simulation-envelope", label: "Provider Simulation", key: "controlled-provider-invocation-simulation-envelope" },
  { href: "/controlled-provider-invocation-simulation-policy", label: "Simulation Policy", key: "controlled-provider-invocation-simulation-policy" },
  { href: "/provider-simulation-dashboard", label: "Simulation Dashboard", key: "provider-simulation-dashboard" },
  { href: "/controlled-real-provider-invocation-gate", label: "Real Provider Gate", key: "controlled-real-provider-invocation-gate" },
  { href: "/real-provider-gate-dashboard", label: "Real Gate Dashboard", key: "real-provider-gate-dashboard" },
  { href: "/human-approval-token-request", label: "Approval Token Request", key: "human-approval-token-request" },
  { href: "/approval-token-request-policy", label: "Approval Token Policy", key: "approval-token-request-policy" },
  { href: "/approval-token-request-dashboard", label: "Approval Token Dashboard", key: "approval-token-request-dashboard" },
  { href: "/approval-token-issuance-gate", label: "Token Issuance Gate", key: "approval-token-issuance-gate" },
  { href: "/approval-token-issuance-policy", label: "Token Issuance Policy", key: "approval-token-issuance-policy" },
  { href: "/approval-token-issuance-dashboard", label: "Token Issuance Dashboard", key: "approval-token-issuance-dashboard" },
  { href: "/approval-token-activation-gate", label: "Token Activation Gate", key: "approval-token-activation-gate" },
  { href: "/approval-token-activation-policy", label: "Token Activation Policy", key: "approval-token-activation-policy" },
  { href: "/approval-token-activation-dashboard", label: "Token Activation Dashboard", key: "approval-token-activation-dashboard" },
  { href: "/token-backed-provider-invocation-preflight", label: "Token Provider Preflight", key: "token-backed-provider-invocation-preflight" },
  { href: "/token-backed-provider-preflight-policy", label: "Token Provider Policy", key: "token-backed-provider-preflight-policy" },
  { href: "/token-backed-provider-preflight-dashboard", label: "Token Provider Dashboard", key: "token-backed-provider-preflight-dashboard" },
  { href: "/provider-request-contract", label: "Provider Request Contract", key: "provider-request-contract" },
  { href: "/provider-request-contract-policy", label: "Provider Request Policy", key: "provider-request-contract-policy" },
  { href: "/provider-dispatch-approval-candidate-envelope", label: "Dispatch Approval Candidate", key: "provider-dispatch-approval-candidate-envelope" },
  { href: "/provider-dispatch-approval-candidate-envelope-policy", label: "Dispatch Approval Policy", key: "provider-dispatch-approval-candidate-envelope-policy" },
  { href: "/provider-dispatch-approval-candidate-envelope-dashboard", label: "Approval Dashboard", key: "provider-dispatch-approval-candidate-envelope-dashboard" },
  { href: "/provider-dispatch-approval-policy-confirmation-envelope", label: "Approval Policy Confirmation", key: "provider-dispatch-approval-policy-confirmation-envelope" },
  { href: "/provider-dispatch-approval-policy-confirmation-policy", label: "Approval Confirmation Policy", key: "provider-dispatch-approval-policy-confirmation-policy" },
  { href: "/provider-dispatch-approval-policy-confirmation-dashboard", label: "Approval Confirmation Dashboard", key: "provider-dispatch-approval-policy-confirmation-dashboard" },
  { href: "/provider-dispatch-human-approval-token-envelope", label: "Human Approval Token", key: "provider-dispatch-human-approval-token-envelope" },
  { href: "/provider-dispatch-human-approval-token-policy", label: "Human Approval Token Policy", key: "provider-dispatch-human-approval-token-policy" },
  { href: "/provider-dispatch-human-approval-token-dashboard", label: "Human Approval Token Dashboard", key: "provider-dispatch-human-approval-token-dashboard" },
  { href: "/provider-dispatch-human-approval-token-issuance-candidate", label: "Token Issuance Candidate", key: "provider-dispatch-human-approval-token-issuance-candidate" },
  { href: "/provider-dispatch-human-approval-token-issuance-candidate-policy", label: "Token Issuance Policy", key: "provider-dispatch-human-approval-token-issuance-candidate-policy" },
  { href: "/provider-dispatch-human-approval-token-issuance-candidate-dashboard", label: "Token Issuance Dashboard", key: "provider-dispatch-human-approval-token-issuance-candidate-dashboard" },
];

const ADMIN_GROUPS: NavGroup[] = [
  {
    title: "Governance",
    items: [
      { href: "/capability-requests", label: "Capability Requests", key: "capability-requests" },
      { href: "/agent-blueprints", label: "Agent Blueprints", key: "agent-blueprints" },
      { href: "/agent-registry", label: "Agent Registry", key: "agent-registry" },
      { href: "/tool-permissions", label: "Tool Permissions", key: "tool-permissions" },
      { href: "/tool-preflight", label: "Tool Preflight", key: "tool-preflight" },
    ],
  },
  {
    title: "Runtime",
    items: [
      { href: "/agent-runtime-dashboard", label: "Runtime Dashboard", key: "agent-runtime-dashboard" },
      { href: "/agent-runtime", label: "Agent Runtime", key: "agent-runtime" },
      { href: "/agent-runtime-consent", label: "Runtime Consent", key: "agent-runtime-consent" },
      { href: "/agent-runtime-resume", label: "Runtime Resume", key: "agent-runtime-resume" },
      { href: "/agent-runtime-policy", label: "Runtime Policy", key: "agent-runtime-policy" },
    ],
  },
  {
    title: "Tool Adapter",
    items: [
      { href: "/tool-adapter-dashboard", label: "Tool Dashboard", key: "tool-adapter-dashboard" },
      { href: "/tool-sandbox", label: "Tool Sandbox", key: "tool-sandbox" },
      { href: "/tool-adapter-consent", label: "Tool Consent Binding", key: "tool-adapter-consent" },
      { href: "/tool-adapter-resume", label: "Tool Resume", key: "tool-adapter-resume" },
      { href: "/tool-adapter-policy", label: "Tool Policy", key: "tool-adapter-policy" },
    ],
  },
  {
    title: "System & Knowledge",
    items: [
      { href: "/analytics", label: "Analytics", key: "analytics" },
      { href: "/logs", label: "Logs", key: "logs" },
      { href: "/system", label: "System", key: "system" },
      { href: "/knowledge", label: "Knowledge", key: "knowledge" },
      { href: "/knowledge-quality", label: "Knowledge Quality", key: "knowledge-quality" },
      { href: "/memory", label: "Memory", key: "memory" },
      { href: "/memory-quality", label: "Memory Quality", key: "memory-quality" },
      { href: "/memory-sessions", label: "Memory Sessions", key: "memory-sessions" },
    ],
  },
  {
    title: "Web Research",
    items: [
      { href: "/web-research", label: "Web Research", key: "web-research" },
      { href: "/web-research-governance", label: "Web Governance", key: "web-research-governance" },
      { href: "/web-research-save", label: "Web Save", key: "web-research-save" },
      { href: "/web-research-settings", label: "Web Settings", key: "web-research-settings" },
      { href: "/tools", label: "Tools", key: "tools" },
    ],
  },
];

function isGroupActive(group: NavGroup, active?: string): boolean {
  return group.items.some((item) => item.key === active);
}

export function UnifiedNavigation({ active }: { active?: string }) {
  const primaryActive = PRIMARY_NAV_ITEMS.some((item) => item.key === active);
  return (
    <nav className="unified-nav phase14-nav" aria-label="Main navigation">
      <div className="phase14-primary-nav" aria-label="Primary navigation">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const isActive = active === item.key || (!primaryActive && item.key === "master-cockpit" && !active);
          return (
            <a
              key={item.key}
              className={isActive ? "unified-nav-link active" : "unified-nav-link"}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </a>
          );
        })}
      </div>
      <details className="phase14-admin-nav">
        <summary>Admin / Developer</summary>
        <div className="phase14-admin-grid">
          {ADMIN_GROUPS.map((group) => (
            <section className={isGroupActive(group, active) ? "phase14-nav-group active" : "phase14-nav-group"} key={group.title}>
              <h3>{group.title}</h3>
              <div className="phase14-nav-group-links">
                {group.items.map((item) => {
                  const isActive = active === item.key;
                  return (
                    <a
                      key={item.key}
                      className={isActive ? "phase14-mini-link active" : "phase14-mini-link"}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </details>
    </nav>
  );
}