import { getCommitteeMvpDemo, type CommitteeMvpDemo } from './cmt-demo';
import { getCommitteeDemoReport, type CommitteeDemoReport } from './cmt-demo-report';
import { getCommitteeDemoShare, type CommitteeDemoShare } from './cmt-demo-share';

export type CommitteeLanding = {
  phase: '115.0';
  label: 'Gremium MVP Landing';
  hero: {
    title: string;
    subtitle: string;
    primaryPath: string;
    secondaryPath: string;
  };
  links: {
    title: string;
    href: string;
    description: string;
  }[];
  demo: CommitteeMvpDemo;
  report: CommitteeDemoReport;
  share: CommitteeDemoShare;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getCommitteeLanding(): CommitteeLanding {
  return {
    phase: '115.0',
    label: 'Gremium MVP Landing',
    hero: {
      title: 'Gremium-Agent MVP',
      subtitle: 'Eine dry-run-only Landing Page fuer Demo, Report und Share des Gremium-Agenten.',
      primaryPath: '/cmt/demo',
      secondaryPath: '/cmt/demo/share',
    },
    links: [
      { title: 'Demo starten', href: '/cmt/demo', description: 'Fuehrt eine Nutzerfrage durch den MVP-Demo-Flow.' },
      { title: 'Report ansehen', href: '/cmt/demo/report', description: 'Zeigt den kompakten Demo-Report.' },
      { title: 'Share erzeugen', href: '/cmt/demo/share', description: 'Erstellt eine copy-ready Kurzfassung.' },
      { title: 'Session Summary', href: '/cmt/sum', description: 'Zeigt die Zusammenfassung gespeicherter Gremiumsfragen.' },
    ],
    demo: getCommitteeMvpDemo(),
    report: getCommitteeDemoReport(),
    share: getCommitteeDemoShare(),
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
