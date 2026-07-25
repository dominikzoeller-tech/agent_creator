export type SecureMasterOperatorPanel = {
  localLogCount: number;
  providerDryRunCount: number;
  adapterDryRunCount: number;
  approvalDecision: string;
  currentRecommendation: string;
  currentRiskLevel: string;
  liveStatus: 'blocked';
  providerCallAllowed: false;
  dryRunOnly: true;
  nextThreshold: string;
};

export function createSecureMasterOperatorPanel(params: {
  localLogCount: number;
  providerDryRunCount: number;
  adapterDryRunCount: number;
  approvalDecision: string;
  currentRecommendation?: string;
  currentRiskLevel?: string;
}): SecureMasterOperatorPanel {
  return {
    localLogCount: params.localLogCount,
    providerDryRunCount: params.providerDryRunCount,
    adapterDryRunCount: params.adapterDryRunCount,
    approvalDecision: params.approvalDecision,
    currentRecommendation: params.currentRecommendation ?? 'none',
    currentRiskLevel: params.currentRiskLevel ?? 'none',
    liveStatus: 'blocked',
    providerCallAllowed: false,
    dryRunOnly: true,
    nextThreshold: 'Naechste Schwelle: Provider-Adapter als deaktivierten Codepfad vorbereiten. Noch keine Live-KI aktivieren.',
  };
}
