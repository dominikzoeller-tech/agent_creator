import { askSecureMasterUnified, type SecureMasterUnifiedResult } from './cmt-master-unified';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterMainBadge = {
  label: string;
  value: string;
  tone: 'neutral' | 'good' | 'warn' | 'blocked';
};

export type SecureMasterMainViewModel = SecureMasterUnifiedResult & {
  phaseView: '128.0';
  viewLabel: 'Secure Master Main Structured View';
  badges: SecureMasterMainBadge[];
  compactBlocks: {
    title: string;
    body: string;
    priority: 'primary' | 'secondary' | 'safety';
  }[];
  roleCards: {
    title: string;
    subtitle: string;
    body: string;
  }[];
};

function toneForBoolean(value: boolean, goodWhenTrue = true): SecureMasterMainBadge['tone'] {
  if (value === goodWhenTrue) return 'good';
  return 'warn';
}

function badges(result: SecureMasterUnifiedResult): SecureMasterMainBadge[] {
  return [
    { label: 'Route', value: result.finalRoute, tone: 'neutral' },
    { label: 'Intent', value: result.detectedIntent, tone: 'neutral' },
    { label: 'Privacy Gate', value: result.showsPrivacyGate ? 'visible' : 'not needed', tone: result.showsPrivacyGate ? 'warn' : 'good' },
    { label: 'Gremium', value: result.showsCommitteeWhenNeeded ? 'visible' : 'not needed', tone: result.showsCommitteeWhenNeeded ? 'neutral' : 'good' },
    { label: 'Live Model', value: result.liveModelEnabled ? 'enabled' : 'disabled', tone: result.liveModelEnabled ? 'warn' : 'good' },
    { label: 'External Sharing', value: result.externalSharingAllowed ? 'allowed' : 'blocked', tone: result.externalSharingAllowed ? 'warn' : 'blocked' },
    { label: 'Network', value: result.networkCallAllowed ? 'allowed' : 'blocked', tone: result.networkCallAllowed ? 'warn' : 'blocked' },
  ];
}

function compactBlocks(result: SecureMasterUnifiedResult): SecureMasterMainViewModel['compactBlocks'] {
  const blocks = result.unifiedAnswerBlocks.map((block) => ({
    title: block.title,
    body: block.body,
    priority: block.title === 'Lokale Antwort' ? 'primary' as const : block.title === 'Safety' ? 'safety' as const : 'secondary' as const,
  }));

  if (!blocks.some((block) => block.title === 'Safety')) {
    blocks.push({
      title: 'Safety',
      body: 'Kein Provider, kein Internet, kein Live-Modell, keine externe Weitergabe.',
      priority: 'safety',
    });
  }

  return blocks;
}

function roleCards(result: SecureMasterUnifiedResult): SecureMasterMainViewModel['roleCards'] {
  return result.committeeRoles.map((role) => ({
    title: role.name,
    subtitle: role.focus,
    body: role.answer,
  }));
}

export function askSecureMasterMainView(input: string, option: PrivacyDecisionOption = 'local_only'): SecureMasterMainViewModel {
  const result = askSecureMasterUnified(input, option);
  return {
    ...result,
    phaseView: '128.0',
    viewLabel: 'Secure Master Main Structured View',
    badges: badges(result),
    compactBlocks: compactBlocks(result),
    roleCards: roleCards(result),
  };
}

export function getSecureMasterMainViewDemo() {
  return askSecureMasterMainView('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?', 'local_only');
}
