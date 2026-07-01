"use client";

type NavItem = {
  href: string;
  label: string;
  key: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Chat", key: "chat" },
  { href: "/tool-consent", label: "Tool Consent", key: "tool-consent" },
  { href: "/capability-requests", label: "Capability Requests", key: "capability-requests" },
  { href: "/agent-blueprints", label: "Agent Blueprints", key: "agent-blueprints" },
  { href: "/agent-registry", label: "Agent Registry", key: "agent-registry" },
  { href: "/governance-audit", label: "Audit Trail", key: "governance-audit" },
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
