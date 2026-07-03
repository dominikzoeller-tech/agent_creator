"use client";

type NavItem = {
  href: string;
  label: string;
  key: string;
};

// Phase 11.9 release navigation: single source for governance routes.
const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Chat", key: "chat" },
  { href: "/tool-consent", label: "Tool Consent", key: "tool-consent" },
  { href: "/capability-requests", label: "Capability Requests", key: "capability-requests" },
  { href: "/agent-blueprints", label: "Agent Blueprints", key: "agent-blueprints" },
  { href: "/agent-registry", label: "Agent Registry", key: "agent-registry" },
  { href: "/governance-audit", label: "Audit Trail", key: "governance-audit" },
  { href: "/agent-runtime", label: "Agent Runtime", key: "agent-runtime" },
  { href: "/agent-runtime-consent", label: "Runtime Consent", key: "agent-runtime-consent" },
  { href: "/agent-runtime-resume", label: "Runtime Resume", key: "agent-runtime-resume" },
  { href: "/agent-runtime-policy", label: "Runtime Policy", key: "agent-runtime-policy" },
  { href: "/agent-runtime-dashboard", label: "Runtime Dashboard", key: "agent-runtime-dashboard" },
  { href: "/tool-sandbox", label: "Tool Sandbox", key: "tool-sandbox" },
  { href: "/tool-adapter-consent", label: "Tool Consent Binding", key: "tool-adapter-consent" },
  { href: "/tool-adapter-resume", label: "Tool Resume", key: "tool-adapter-resume" },
  { href: "/analytics", label: "Analytics", key: "analytics" },
  { href: "/logs", label: "Logs", key: "logs" },
  { href: "/system", label: "System", key: "system" },
];

export function UnifiedNavigation({ active }: { active?: string }) {
  return (
    <nav className="unified-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.key;
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
    </nav>
  );
}
