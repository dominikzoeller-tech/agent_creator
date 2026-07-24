import { getCommitteeHistoryDemo } from '../../../lib/cmt-hist';

export default function CommitteeHistoryPage() {
  const history = getCommitteeHistoryDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 113.0</h1>
      <h2>{history.label}</h2>
      <p>Der Gremium-Agent zeigt einen ersten dry-run-only Verlauf bisheriger Gremiumsfragen.</p>

      <section style={{ display: 'grid', gap: 12 }}>
        {history.items.map((item) => (
          <article key={item.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
            <h3>{item.title}</h3>
            <p><strong>Frage:</strong> {item.question}</p>
            <p><strong>Entscheidung:</strong> {item.view.panels.decision}</p>
            <p><strong>Antwort:</strong> {item.view.panels.answer}</p>
            <h4>Aktionen</h4>
            <ul>{item.view.panels.actions.map((action) => <li key={action}>{action}</li>)}</ul>
          </article>
        ))}
      </section>
    </main>
  );
}
