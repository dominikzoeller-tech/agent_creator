import { getCommitteeLocalJsonPlan, type CommitteeLocalJsonPlan } from './cmt-json';

export type CommitteeLocalJsonStatus = {
  phase: '118.1';
  label: 'Gremium Local JSON Status';
  plan: CommitteeLocalJsonPlan;
  status: {
    ready: true;
    target: 'local-json';
    writeMode: 'planned-only';
    actualFileWriteEnabled: false;
    checks: string[];
    summary: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeLocalJsonStatus(): CommitteeLocalJsonStatus {
  const plan = getCommitteeLocalJsonPlan();
  return {
    phase: '118.1',
    label: 'Gremium Local JSON Status',
    plan,
    status: {
      ready: true,
      target: 'local-json',
      writeMode: 'planned-only',
      actualFileWriteEnabled: false,
      checks: [
        'Local JSON Plan vorhanden',
        'Zielordner geplant',
        'Dateiname geplant',
        'Payload geplant',
        'Echte Datei-Schreibvorgaenge deaktiviert',
        'Safety State dry-run-only',
      ],
      summary: 'Local JSON Persistenz ist geplant und validiert, schreibt aber noch keine Dateien.',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
