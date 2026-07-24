import { getMasterAgentStatus, type MasterAgentStatus } from './cmt-master-status';

export type MasterAgentEntry = {
  phase: '120.2';
  label: 'Master Agent Entry';
  status: MasterAgentStatus;
  entry: {
    title: string;
    description: string;
    primaryHref: '/cmt/master';
    statusHref: '/cmt/master/status';
    committeeHref: '/cmt/ask';
    mode: 'local-router';
    visibleAsMainEntryCandidate: true;
  };
  capabilities: {
    directAnswer: true;
    committeeRouting: true;
    privacyGate: true;
    toolRequiredDetection: true;
    agentBuilderDetection: true;
    liveModel: false;
    internet: false;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getMasterAgentEntry(): MasterAgentEntry {
  const status = getMasterAgentStatus();
  return {
    phase: '120.2',
    label: 'Master Agent Entry',
    status,
    entry: {
      title: 'Master-Agent',
      description: 'Zentraler lokaler Einstieg: Direktantwort, Gremium, Privacy-Gate, Toolbedarf und Spezialagenten-Idee.',
      primaryHref: '/cmt/master',
      statusHref: '/cmt/master/status',
      committeeHref: '/cmt/ask',
      mode: 'local-router',
      visibleAsMainEntryCandidate: true,
    },
    capabilities: {
      directAnswer: true,
      committeeRouting: true,
      privacyGate: true,
      toolRequiredDetection: true,
      agentBuilderDetection: true,
      liveModel: false,
      internet: false,
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
