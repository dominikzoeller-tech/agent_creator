import { createCommitteeDemoReport, type CommitteeDemoReport } from './cmt-demo-report';

export type CommitteeDemoShare = {
  phase: '114.2';
  label: 'Gremium Demo Share';
  report: CommitteeDemoReport;
  share: {
    title: string;
    plainText: string;
    bullets: string[];
    copyReady: true;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeDemoShare(question: string): CommitteeDemoShare {
  const report = createCommitteeDemoReport(question);
  const bullets = [
    'Frage: ' + report.report.question,
    'Verdict: ' + report.report.verdict,
    'Risiken: ' + report.report.riskLines.join(' | '),
    'Aktionen: ' + report.report.actionLines.join(' | '),
    'Safety: dry-run-only, provider none, keine Netzwerk-Calls.',
  ];

  return {
    phase: '114.2',
    label: 'Gremium Demo Share',
    report,
    share: {
      title: 'Gremium-Agent MVP Demo Share',
      plainText: bullets.join('
'),
      bullets,
      copyReady: true,
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeDemoShare() {
  return createCommitteeDemoShare('Soll der Gremium-Agent eine copy-ready Demo-Zusammenfassung erzeugen?');
}
