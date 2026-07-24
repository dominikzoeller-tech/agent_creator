import { getCommitteeCore } from '../../lib/cmt-store';

export default function CommitteeCorePage() {
  const core = getCommitteeCore();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 110.0</h1>
      <h2>{core.label}</h2>
      <p>Internes simuliertes Gremium. Keine Provider-Calls. Dry-run only.</p>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {core.provider}</li>
          <li>modelSelected: {core.modelSelected}</li>
          <li>dryRunOnly: {String(core.dryRunOnly)}</li>
          <li>finalDispatchBlocked: {String(core.finalDispatchBlocked)}</li>
          <li>executionGateClosed: {String(core.executionGateClosed)}</li>
          <li>networkCallAllowed: {String(core.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(core.providerDispatchAllowed)}</li>
        </ul>
      </section>

      <section>
        <h3>Gremiumsrollen</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {core.roles.map((role) => (
            <article key={role.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
              <h4>{role.title}</h4>
              <p><strong>ID:</strong> {role.id}</p>
              <p><strong>Aufgabe:</strong> {role.responsibility}</p>
              <p><strong>Perspektive:</strong> {role.defaultPerspective}</p>
              <p><strong>enabled:</strong> {String(role.enabled)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
