import { createCommitteeMvpDemo, type CommitteeMvpDemo } from './cmt-demo';

export type CommitteeDemoReport = {
  phase: '114.1';
  label: 'Gremium Demo Report';
  demo: CommitteeMvpDemo;
  report: {
    title: string;
    question: string;
    verdict: string;
    flowLines: string[];
    riskLines: string[];
    actionLines: string[];
    conclusion: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeDemoReport(question: string): CommitteeDemoReport {
  const demo = createCommitteeMvpDemo(question);
  return {
    phase: '114.1',
    label: 'Gremium Demo Report',
    demo,
    report: {
      title: 'Gremium-Agent MVP Demo Report',
      question: demo.userQuestion,
      verdict: demo.finalAnswer.recommendation,
      flowLines: demo.flow.map((item) => item.step + ' - ' + item.result),
      riskLines: demo.finalAnswer.risks,
      actionLines: demo.finalAnswer.actions,
      conclusion: 'Der MVP-Demo-Flow wurde dry-run-only abgeschlossen. Es wurden keine Provider- oder Netzwerk-Calls ausgefuehrt.',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeDemoReport() {
  return createCommitteeDemoReport('Soll der Gremium-Agent einen Demo-Report aus dem MVP-Flow erzeugen?');
}
