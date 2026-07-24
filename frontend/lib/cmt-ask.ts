export type CommitteeRoleAnswer = {
  role: string;
  stance: 'support' | 'caution' | 'challenge' | 'execute';
  answer: string;
  risk: string;
  action: string;
};

export type CommitteeAskResult = {
  phase: '119.0';
  label: 'Gremium Ask MVP';
  question: string;
  roles: CommitteeRoleAnswer[];
  finalAnswer: {
    headline: string;
    recommendation: string;
    reasoning: string[];
    risks: string[];
    nextActions: string[];
  };
  usableStatus: 'local-testable';
  liveModelEnabled: false;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

function normalizeQuestion(question: string) {
  const trimmed = question.trim();
  return trimmed || 'Welche Entscheidung soll das Gremium bewerten?';
}

export function askCommitteeLocal(question: string): CommitteeAskResult {
  const q = normalizeQuestion(question);
  const roles: CommitteeRoleAnswer[] = [
    {
      role: 'Strategie',
      stance: 'support',
      answer: 'Die Frage sollte zuerst nach Ziel, Nutzen und Prioritaet bewertet werden.',
      risk: 'Ohne klares Ziel kann der naechste Schritt technisch richtig, aber strategisch falsch sein.',
      action: 'Formuliere das Ziel in einem Satz und pruefe, ob diese Entscheidung direkt darauf einzahlt.',
    },
    {
      role: 'Risiko',
      stance: 'caution',
      answer: 'Die groessten Risiken liegen in unklaren Annahmen, fehlenden Tests und zu fruehem Live-Schalten.',
      risk: 'Wenn der Agent live geht, bevor der lokale Flow stabil ist, entstehen falsche oder schwer nachvollziehbare Antworten.',
      action: 'Teste zuerst lokal mit 5 echten Fragen und dokumentiere Fehlverhalten.',
    },
    {
      role: 'Umsetzung',
      stance: 'execute',
      answer: 'Der naechste sinnvolle Schritt ist ein kleiner vertikaler End-to-End-Test.',
      risk: 'Zu viele weitere Status- und Guide-Seiten verzoegern den ersten Nutzwert.',
      action: 'Nutze die Ask-Seite, pruefe die Antwortstruktur und sammle Verbesserungen.',
    },
    {
      role: 'Kritik',
      stance: 'challenge',
      answer: 'Die Antwortqualitaet ist noch lokal und regelbasiert. Das ist gut zum Testen des Flows, aber noch kein echter KI-Agent.',
      risk: 'Der Nutzer koennte die lokale Antwort mit einer echten Modellantwort verwechseln.',
      action: 'Kennzeichne klar, dass dieser Stand lokal testbar, aber noch nicht live mit Modell ist.',
    },
  ];

  return {
    phase: '119.0',
    label: 'Gremium Ask MVP',
    question: q,
    roles,
    finalAnswer: {
      headline: 'Lokaler Gremium-Test abgeschlossen.',
      recommendation: 'Jetzt lokal testen, noch nicht live schalten.',
      reasoning: [
        'Die Frage wurde durch mehrere Gremiumsrollen bewertet.',
        'Der komplette Ask-Flow ist erstmals ueber UI und API nutzbar.',
        'Die Antworten sind bewusst lokal und deterministisch, damit der Flow stabil getestet werden kann.',
      ],
      risks: roles.map((role) => role.risk),
      nextActions: [
        'Oeffne /cmt/ask und stelle 5 echte Testfragen.',
        'Pruefe, ob Rollenmeinungen, Risiken und Aktionen sinnvoll angezeigt werden.',
        'Sammle Verbesserungen fuer Phase 119.1.',
      ],
    },
    usableStatus: 'local-testable',
    liveModelEnabled: false,
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeAskDemo() {
  return askCommitteeLocal('Wann kann ich den Gremium-Agenten testen und was fehlt noch bis zum Live-Betrieb?');
}
