import { createCommitteeRun, type CommitteeRun } from './cmt-run';

export type CommitteeView = {
  phase: '112.2';
  label: 'Gremium View';
  run: CommitteeRun;
  panels: {
    answer: string;
    decision: string;
    reasons: string[];
    risks: string[];
    actions: string[];
    roles: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeView(input: string): CommitteeView {
  const run = createCommitteeRun(input);
  const brief = run.ask.result.brief;
  const deliberation = run.ask.result.result.session.deliberation;

  return {
    phase: '112.2',
    label: 'Gremium View',
    run,
    panels: {
      answer: brief.userMessage,
      decision: brief.decision,
      reasons: brief.why,
      risks: brief.risks,
      actions: brief.actions,
      roles: deliberation.opinions.map((opinion) => opinion.title + ': ' + opinion.stance),
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeViewDemo() {
  return createCommitteeView('Soll die UI das Gremium-Ergebnis in klaren Panels anzeigen?');
}
