const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
};

export function QuickStartChecklist() {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Quick Start / Betrieb</h2>
      <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.65 }}>
        <li>Im Root-Ordner die API starten mit <code>npm run api:start</code>.</li>
        <li>Im <code>frontend</code>-Ordner die UI starten mit <code>npm run dev</code>.</li>
        <li>Browser auf <code>http://localhost:3000</code> öffnen.</li>
        <li>Für sensible Inhalte zuerst Redaction Preview nutzen.</li>
        <li>Logs und Analytics regelmäßig prüfen, um Routing und Empfehlungen nachzuvollziehen.</li>
      </ol>
    </section>
  );
}
