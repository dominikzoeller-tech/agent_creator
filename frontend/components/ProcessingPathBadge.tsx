import { ProcessingPath } from "../lib/types";

interface ProcessingPathBadgeProps {
  processingPath: ProcessingPath;
}

const palette: Record<ProcessingPath, { background: string; color: string; border: string }> = {
  cloud_raw: { background: "#dcfce7", color: "#166534", border: "#4ade80" },
  cloud_redacted: { background: "#fef3c7", color: "#92400e", border: "#f59e0b" },
  local_policy: { background: "#fee2e2", color: "#991b1b", border: "#f87171" },
};

export function ProcessingPathBadge({ processingPath }: ProcessingPathBadgeProps) {
  const colors = palette[processingPath];
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    background: colors.background,
    color: colors.color,
    border: `1px solid ${colors.border}`,
  };
  return <span style={style}>Processing: {processingPath}</span>;
}
