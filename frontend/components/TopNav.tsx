"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 20px",
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

const linkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 14,
};

const links = [
  { href: "/", label: "Chat" },
  { href: "/logs", label: "Logs" },
  { href: "/analytics", label: "Analytics" },
  { href: "/system", label: "System" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav style={navStyle}>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            style={linkStyle}
            className={isActive ? "nav-link-active" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
