/**
 * Agent Self-Build Plan Generator
 *
 * Erzeugt konkrete Patch-Pläne für Agent-Selbstentwicklung.
 * Der Plan beschreibt: Was? Warum? Wie? In welcher Reihenfolge?
 * Keine automatische Dateiänderung - nur Anleitung.
 */

export interface SelfBuildChange {
  priority: "critical" | "high" | "medium" | "low";
  fileOrComponent: string;
  change: string;
  reason: string;
  difficulty: "easy" | "medium" | "hard";
  copilotPrompt: string;
}

export interface SelfBuildPlan {
  timestamp: string;
  agentVersion: string;
  planId: string;
  title: string;
  summary: string;
  totalChanges: number;
  estimatedDays: number;
  changes: SelfBuildChange[];
  commands: {
    label: string;
    command: string;
    description: string;
  }[];
  commitMessage: string;
  notes: string[];
}

export function generateSelfBuildPlan(): SelfBuildPlan {
  const planId = `sbp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    timestamp: new Date().toISOString(),
    agentVersion: "1.1.0-selfbuild",
    planId,
    title: "Secure Master Agent - Workspace & Self-Build Foundation (Phase 1)",
    summary:
      "Aufbau einer praktisch nutzbaren Arbeitsfläche für den Master Agent. Fokus: einfache Workspace-Integration, Selbstbau-Modus als API, konkrete Patch-Pläne statt Dashboard-Diagnose.",

    totalChanges: 5,
    estimatedDays: 2,

    changes: [
      {
        priority: "critical",
        fileOrComponent: "agent-self-build-plan.ts",
        change: "Neue Datei: Definiert Struktur und Generierung von Patch-Plänen",
        reason:
          "Der Agent soll konkrete, actionable Pläne erzeugen können. Diese Datei ist die Basis für strukturierte Self-Build-Pläne.",
        difficulty: "easy",
        copilotPrompt:
          "Erstelle eine TypeScript-Datei, die Patch-Pläne für Agent-Selbstentwicklung strukturiert. Der Plan soll enthalten: Priority, Dateien, Änderungen, Gründe, Copilot-Prompts für jede Änderung, Testbefehle, Commit-Message. Keine automatischen Dateiänderungen - nur strukturierte Anleitung.",
      },
      {
        priority: "critical",
        fileOrComponent: "server.ts",
        change:
          'Neue Route: GET /api/cmt/master/secure/self-build/plan\nRückgabe: JSON mit SelfBuildPlan\nKeine Secrets im Response',
        reason:
          "API-Zugang zu Self-Build-Plänen. Der Agent kann jetzt per API angefordert werden, was neue Agenten bauen sollen.",
        difficulty: "medium",
        copilotPrompt:
          "Füge in server.ts eine neue GET-Route ein: /api/cmt/master/secure/self-build/plan. Die Route sollte generateSelfBuildPlan() aufrufen und ein JSON-Response mit SelfBuildPlan zurückgeben. Status 200, CORS-Header beachten. Keine .env-Secrets im Response.",
      },
      {
        priority: "high",
        fileOrComponent: "agent-self-builder-1/agent-self-builder-1.cjs",
        change:
          "Neues Script: Ruft /api/cmt/master/secure/self-build/plan auf und speichert Plan als JSON",
        reason:
          "Praktischer Zugriff auf den Plan. Benutzer kann lokale Testbefehle ausführen ohne Server im Browser zu öffnen.",
        difficulty: "medium",
        copilotPrompt:
          "Schreibe ein Node.js/CommonJS-Script (agent-self-builder-1.cjs) das:\n1. Fetch zu http://localhost:7071/api/cmt/master/secure/self-build/plan macht\n2. Den Response als JSON speichert in: agent-self-builder-1/output/self-build-plan-[timestamp].json\n3. Das Plan in der Console formatted ausgibt\n4. Keine .env-Secrets\n5. Error-Handling für Server offline / timeout",
      },
      {
        priority: "high",
        fileOrComponent: "package.json",
        change:
          "Neue Scripts:\n- selfbuilder1:plan\n- selfbuilder1:verify\n- selfbuilder1:apply",
        reason:
          "Einfache CLI-Zugriffe für Workspace-Integrationl. Benutzer kann schnell `npm run selfbuilder1:plan` eingeben.",
        difficulty: "easy",
        copilotPrompt:
          "Füge in package.json neue Scripts hinzu:\nselfbuilder1:plan -> node agent-self-builder-1/scripts/agent-self-builder-1.cjs\nselfbuilder1:verify -> node agent-self-builder-1/scripts/verify.cjs\nselfbuilder1:apply -> node agent-self-builder-1/scripts/apply.cjs\nKommentare mit Beschreibung hinzufügen.",
      },
      {
        priority: "high",
        fileOrComponent: "agent-self-builder-1/scripts/verify.cjs",
        change:
          "Neues Script: Überprüft ob Self-Build-Plan anwendbar ist (Dateien vorhanden, keine Konflikte)",
        reason:
          "Vor Anwendung soll der Plan validiert werden. Verhindert Fehler bei fehlenden Dateien oder Versionskonflikten.",
        difficulty: "medium",
        copilotPrompt:
          "Schreibe verify.cjs:\n1. Liest die neueste self-build-plan-[timestamp].json\n2. Für jede Änderung: prüfe ob Zieldatei existiert\n3. Prüfe ob git status clean ist (keine uncommitted changes in zu ändernden Dateien)\n4. Gib Check-Report aus mit ✓/✗ für jede Datei\n5. Exit-Code 0 wenn alles OK, 1 wenn Probleme\n6. Keine .env-Secrets",
      },
    ],

    commands: [
      {
        label: "Plan generieren",
        command: "npm run selfbuilder1:plan",
        description:
          "Ruft API auf und speichert Self-Build-Plan lokal. Zeigt Plan in Console.",
      },
      {
        label: "Plan validieren",
        command: "npm run selfbuilder1:verify",
        description:
          "Prüft ob Plan anwendbar ist (Dateien vorhanden, keine Konflikte).",
      },
      {
        label: "Build testen",
        command: "npm run build",
        description: "Kompiliert TypeScript und prüft ob alles funktioniert.",
      },
      {
        label: "API starten",
        command: "npm run api:start",
        description: "Startet den Server auf Port 7071. Dann: curl localhost:7071/health",
      },
    ],

    commitMessage: `feat(selfbuild): Self-Build-Plan Generator für praktische Agent-Entwicklung

- Implementiere agent-self-build-plan.ts mit strukturierten Patch-Plänen
- Füge GET /api/cmt/master/secure/self-build/plan Route ein
- Schreibe agent-self-builder-1.cjs Script für lokale Plan-Verwaltung
- Füge verify.cjs für Plan-Validierung hinzu
- Neue Scripts in package.json: selfbuilder1:plan/verify/apply
- Keine echten Secrets in Client oder Repo; nur Placeholder-Token

Fokus: Workspace + Selbstbau-Modus statt Diagnose-Dashboard
No automatic file changes - structured guidance only
Next: UI-Sektion /cmt/master/secure/agent implementieren`,

    notes: [
      "🔐 Keine echten Secrets im Response oder in Skripten",
      "📝 Alle Pläne werden lokal gespeichert in agent-self-builder-1/output/",
      "✅ Verify vor Apply - keine überraschungen",
      "🔄 Iterativ: Plan -> Verify -> Review -> Apply (manuell)",
      "📊 Später: UI-Sektion um Pläne zu visualisieren und anzuwenden",
      "🚀 Quick-Start: npm run selfbuilder1:plan && npm run selfbuilder1:verify",
    ],
  };
}

export function formatPlanForConsole(plan: SelfBuildPlan): string {
  const lines: string[] = [];

  lines.push("\n╔═══════════════════════════════════════════════════════════╗");
  lines.push("║        SECURE MASTER AGENT - SELF-BUILD PLAN              ║");
  lines.push("╚═══════════════════════════════════════════════════════════╝\n");

  lines.push(`📋 Plan ID: ${plan.planId}`);
  lines.push(`📅 Timestamp: ${plan.timestamp}`);
  lines.push(`🔖 Version: ${plan.agentVersion}\n`);

  lines.push(`📌 Title: ${plan.title}`);
  lines.push(`📝 Summary: ${plan.summary}\n`);

  lines.push(`📊 Metrics:`);
  lines.push(`   Changes: ${plan.totalChanges}`);
  lines.push(`   Estimated Days: ${plan.estimatedDays}\n`);

  lines.push("─ Changes ─────────────────────────────────────────────────");
  for (const change of plan.changes) {
    const priorityEmoji: Record<string, string> = {
      critical: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "🟢",
    };
    const difficultyEmoji: Record<string, string> = {
      easy: "✅",
      medium: "⚠️",
      hard: "🔧",
    };

    lines.push(`\n${priorityEmoji[change.priority]} [${change.difficulty.toUpperCase()}] ${change.fileOrComponent}`);
    lines.push(`   Change: ${change.change}`);
    lines.push(`   Reason: ${change.reason}`);
    lines.push(`   Copilot: "${change.copilotPrompt.split("\n")[0]}..."`);
  }

  lines.push("\n─ Quick Commands ──────────────────────────────────────────");
  for (const cmd of plan.commands) {
    lines.push(`\n  $ ${cmd.command}`);
    lines.push(`    ${cmd.description}`);
  }

  lines.push("\n─ Notes ───────────────────────────────────────────────────");
  for (const note of plan.notes) {
    lines.push(`  ${note}`);
  }

  lines.push("\n─ Commit Message ──────────────────────────────────────────");
  lines.push(`\n${plan.commitMessage}`);

  lines.push("\n═════════════════════════════════════════════════════════════\n");

  return lines.join("\n");
}
