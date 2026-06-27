# VS Code Copilot Prompt – Phase 6.1 Agent Capability Registry

Nutze diesen Prompt in VS Code Copilot, um Phase 6.1 umzusetzen.

---

## Prompt

Du bist mein Senior TypeScript Architect. Bitte implementiere Phase 6.1 in diesem bestehenden Projekt.

Ziel: Eine Agent Capability Registry hinzufügen, ohne bestehende API-/Frontend-/Docker-Funktionalität zu beschädigen.

Anforderungen:

1. Neue Datei im Root anlegen:
   - `agent-capabilities.ts`

2. In `agent-capabilities.ts` folgende Typen definieren:

```ts
export type AgentCapabilityCategory =
  | "decision"
  | "privacy"
  | "planning"
  | "risk"
  | "technical"
  | "writing"
  | "research";

export interface AgentCapability {
  id: string;
  label: string;
  description: string;
  category: AgentCapabilityCategory;
  triggers: string[];
  outputs: string[];
  privacyNotes: string[];
  enabled: boolean;
}
```

3. Eine konstante Registry exportieren:

```ts
export const AGENT_CAPABILITIES: AgentCapability[] = [...]
```

Enthalten sein sollen mindestens:
- decision_agent
- privacy_agent
- planning_agent
- risk_agent
- technical_agent
- writing_agent
- research_agent

4. Diese Helper-Funktionen exportieren:

```ts
export function getAgentCapabilities(): AgentCapability[]
export function getEnabledAgentCapabilities(): AgentCapability[]
export function getAgentCapabilityById(id: string): AgentCapability | undefined
export function suggestAgentCapabilities(userInput: string): AgentCapability[]
```

5. `suggestAgentCapabilities` soll zunächst regelbasiert sein:
- Datenschutz-Begriffe -> privacy_agent
- Entscheidung / Option / Empfehlung -> decision_agent
- Plan / Phase / Roadmap / Schritt -> planning_agent
- Risiko / Sicherheit / Fehler -> risk_agent
- Docker / API / TypeScript / Frontend / Code -> technical_agent
- README / Doku / Text -> writing_agent
- Recherche / Vergleich / aktuell -> research_agent

6. Bestehende Tests/Builds dürfen nicht kaputtgehen.

7. Ergänze optional eine kleine CLI-Testdatei:
   - `agent-capabilities-smoke-test.ts`

Diese soll beispielhaft mehrere Inputs durch `suggestAgentCapabilities` schicken und die vorgeschlagenen Agenten ausgeben.

8. Ergänze optional npm Script in Root `package.json`:

```json
"agent:capabilities:test": "npx ts-node agent-capabilities-smoke-test.ts"
```

9. Bitte nach der Implementierung kurz zusammenfassen:
- welche Dateien geändert wurden
- wie ich den Test starte
- was als nächster Integrationsschritt in `council-engine.ts` sinnvoll ist

Wichtig:
- Keine Secrets verändern
- `.env` nicht anfassen
- Frontend nicht umbauen
- Docker Compose nicht umbauen
- erstmal nur Registry + Smoke Test
