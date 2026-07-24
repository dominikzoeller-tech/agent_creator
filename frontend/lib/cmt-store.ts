export type CommitteeRoleId =
  | 'strategy'
  | 'legal'
  | 'technical'
  | 'finance'
  | 'risk'
  | 'execution';

export type CommitteeRole = {
  id: CommitteeRoleId;
  title: string;
  responsibility: string;
  defaultPerspective: string;
  enabled: true;
};

export type CommitteeCore = {
  phase: '110.0';
  label: 'Gremium Core';
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  finalDispatchBlocked: true;
  executionGateClosed: true;
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  roles: CommitteeRole[];
};

export const committeeRoles: CommitteeRole[] = [
  {
    id: 'strategy',
    title: 'Strategy',
    responsibility: 'Bewertet Zielbild, Nutzen, Prioritaet und strategische Passung.',
    defaultPerspective: 'Langfristiger Nutzen, Zielkonflikte, Positionierung und Entscheidungsklarheit.',
    enabled: true,
  },
  {
    id: 'legal',
    title: 'Legal',
    responsibility: 'Prueft rechtliche, regulatorische und vertragliche Risiken.',
    defaultPerspective: 'Compliance, Haftung, Datenschutz, Vertragslage und Freigabebedarf.',
    enabled: true,
  },
  {
    id: 'technical',
    title: 'Technical',
    responsibility: 'Bewertet Architektur, Machbarkeit, Abhaengigkeiten und technische Risiken.',
    defaultPerspective: 'Systemdesign, Umsetzbarkeit, Skalierung, Wartbarkeit und Integrationsrisiken.',
    enabled: true,
  },
  {
    id: 'finance',
    title: 'Finance',
    responsibility: 'Bewertet Kosten, Nutzen, Aufwand, Budget und wirtschaftliche Tragfaehigkeit.',
    defaultPerspective: 'ROI, Kostenrahmen, Opportunitaetskosten, Budgetwirkung und Zahlungsrisiken.',
    enabled: true,
  },
  {
    id: 'risk',
    title: 'Risk',
    responsibility: 'Identifiziert Risiken, Nebenwirkungen, Sicherheitsfragen und offene Annahmen.',
    defaultPerspective: 'Worst case, Eintrittswahrscheinlichkeit, Schadenshoehe und Gegenmassnahmen.',
    enabled: true,
  },
  {
    id: 'execution',
    title: 'Execution',
    responsibility: 'Bewertet Umsetzung, Reihenfolge, Abhaengigkeiten und konkrete naechste Schritte.',
    defaultPerspective: 'Operationalisierung, Meilensteine, Verantwortlichkeiten, Blocker und Lieferbarkeit.',
    enabled: true,
  },
];

export function getCommitteeCore(): CommitteeCore {
  return {
    phase: '110.0',
    label: 'Gremium Core',
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    finalDispatchBlocked: true,
    executionGateClosed: true,
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    roles: committeeRoles,
  };
}
