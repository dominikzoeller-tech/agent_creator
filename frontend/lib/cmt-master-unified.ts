import { askSecureMasterCommittee, type SecureMasterCommitteeResult } from './cmt-master-committee';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterUnifiedResult = SecureMasterCommitteeResult & {
  phaseUnified: '126.0';
  unifiedLabel: 'Secure Master Unified Main Flow';
  unifiedMainPage: '/cmt/master/secure';
  showsPrivacyGate: boolean;
  showsQualityAnswer: true;
  showsCommitteeWhenNeeded: boolean;
  unifiedAnswerBlocks: {
    title: string;
    body: string;
  }[];
};

function buildBlocks(result: SecureMasterCommitteeResult) {
  const blocks = [
    {
      title: 'Lokale Antwort',
      body: result.improvedAnswer || result.userVisibleAnswer,
    },
    {
      title: 'Routing',
      body: 'Intent: ' + result.detectedIntent + ' | Route: ' + result.finalRoute + ' | Privacy: ' + result.privacy.decision.decision,
    },
  ];

  if (result.requiresUserApproval || result.privacy.decision.decision !== 'allow_local_only') {
    blocks.push({
      title: 'Privacy Gate',
      body: 'Datenschutzprüfung aktiv. Externe Weitergabe bleibt blockiert. Sichere Verarbeitung: local_only oder anonymisierte Vorschau.',
    });
  }

  if (result.committeeTriggered) {
    blocks.push({
      title: '5er-Gremium',
      body: result.committeeSummary + ' Empfehlung: ' + result.finalRecommendation,
    });
  }

  blocks.push({
    title: 'Safety',
    body: 'Kein Provider, kein Internet, kein Live-Modell, keine externe Weitergabe.',
  });

  return blocks;
}

export function askSecureMasterUnified(input: string, option: PrivacyDecisionOption = 'local_only'): SecureMasterUnifiedResult {
  const result = askSecureMasterCommittee(input, option);
  return {
    ...result,
    phaseUnified: '126.0',
    unifiedLabel: 'Secure Master Unified Main Flow',
    unifiedMainPage: '/cmt/master/secure',
    showsPrivacyGate: result.requiresUserApproval || result.privacy.decision.decision !== 'allow_local_only',
    showsQualityAnswer: true,
    showsCommitteeWhenNeeded: result.committeeTriggered,
    unifiedAnswerBlocks: buildBlocks(result),
  };
}

export function getSecureMasterUnifiedDemo() {
  return askSecureMasterUnified('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?', 'local_only');
}
