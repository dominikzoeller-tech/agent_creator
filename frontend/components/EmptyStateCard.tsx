interface EmptyStateCardProps {
  title: string;
  description: string;
}

export function EmptyStateCard({ title, description }: EmptyStateCardProps) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px dashed #cbd5e1",
        borderRadius: 16,
        padding: 20,
        color: "#334155",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#64748b" }}>
        {title}
      </div>
      <div style={{ marginTop: 8, lineHeight: 1.55 }}>{description}</div>
    </section>
  );
}
