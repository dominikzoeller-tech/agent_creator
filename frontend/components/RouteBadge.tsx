import { RouteType } from "../lib/types";

interface RouteBadgeProps {
  route: RouteType;
}

export function RouteBadge({ route }: RouteBadgeProps) {
  const isCouncil = route === "council";
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    background: isCouncil ? "#fef3c7" : "#dbeafe",
    color: isCouncil ? "#92400e" : "#1d4ed8",
    border: `1px solid ${isCouncil ? "#f59e0b" : "#60a5fa"}`,
  };
  return <span style={style}>Route: {route}</span>;
}
