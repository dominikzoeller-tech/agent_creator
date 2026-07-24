import { askMasterAgentLocal, type MasterAgentResult } from './cmt-master';
import { evaluatePrivacyGate, type PrivacyGateResult } from './cmt-privacy-gate';
import { decidePrivacyAction, type PrivacyDecisionOption, type PrivacyDecisionResult } from './cmt-privacy-decision';

export type SecureMasterAgentResult = {
  phase: '122.0';
  label: 'Secure Master Agent MVP';
  input: string;
  requestedPrivacyOption: PrivacyDecisionOption;
  privacy: PrivacyGateResult;
  privacyDecision: PrivacyDecisionResult;
  master: MasterAgentResult;
  finalRoute: 'direct' | 'committee' | 'privacy_gate' | 'tool_required' | 'agent_builder';
  userVisibleAnswer: string;
  blocksExternalSharing: true;
  requiresUserApproval: boolean;
  suggestedOpenPages: string[];
  externalSharingAllowed: false;
  liveModelEnabled: false;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

function answerForRoute(master: MasterAgentResult, privacy: PrivacyGateResult, decision: PrivacyDecisionResult) {
  if (decision.outcome.mode === 'blocked') {
    return 'Externe Weitergabe ist blockiert. Der Master-Agent verarbeitet diese Eingabe nur lokal oder nach Anonymisierungsvorschau.';
  }
  if (decision.outcome.mode === 'cancelled') {
    return 'Der Vorgang wurde abgebrochen. Es findet keine Verarbeitung und keine Weitergabe statt.';
  }
  if (privacy.decision.decision === 'block_external') {
    return 'Der Master-Agent hat vertrauliche/geheime Signale erkannt. Es wird nur lokal verarbeitet. Keine Provider-, Internet- oder externe Weitergabe.';
  }
  if (privacy.decision.decision === 'require_anonymization') {
    return 'Der Master-Agent hat interne, personenbezogene oder geschäftliche Signale erkannt. Erst anonymisieren bzw. lokal verarbeiten. Externe Weitergabe bleibt deaktiviert.';
  }
  if (master.route === 'committee') {
    return 'Der Master-Agent würde lokal das 5er-Gremium einbeziehen, weil die Frage nach Entscheidung, Risiko oder Strategie klingt.';
  }
  if (master.route === 'tool_required') {
    return 'Der Master-Agent erkennt Toolbedarf. Für aktuelle Live-Daten wäre später ein freigegebenes Tool nötig. Aktuell keine Internet-/Provider-Nutzung.';
  }
  if (master.route === 'agent_builder') {
    return 'Der Master-Agent erkennt Potenzial für einen Spezialagenten und kann lokal einen Agenten-Entwurf vorbereiten.';
  }
  return 'Der Master-Agent beantwortet diese Eingabe lokal direkt. Kein Provider, kein Internet und keine externe Weitergabe.';
}

export function askSecureMasterAgent(input: string, option: PrivacyDecisionOption = 'local_only'): SecureMasterAgentResult {
  const normalized = input.trim() || 'Was soll der Master-Agent pruefen?';
  const privacy = evaluatePrivacyGate(normalized);
  const privacyDecision = decidePrivacyAction(normalized, option);
  const master = askMasterAgentLocal(normalized);
  const finalRoute = privacy.approval.required || privacy.decision.decision !== 'allow_local_only'
    ? 'privacy_gate'
    : master.route;

  return {
    phase: '122.0',
    label: 'Secure Master Agent MVP',
    input: normalized,
    requestedPrivacyOption: option,
    privacy,
    privacyDecision,
    master,
    finalRoute,
    userVisibleAnswer: answerForRoute(master, privacy, privacyDecision),
    blocksExternalSharing: true,
    requiresUserApproval: privacy.approval.required,
    suggestedOpenPages: ['/cmt/master', '/cmt/privacy', '/cmt/privacy/decision', '/cmt/ask'],
    externalSharingAllowed: false,
    liveModelEnabled: false,
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getSecureMasterDemo() {
  return askSecureMasterAgent('Soll ich diese interne Kalkulation fuer Kunde Muster mit dem Gremium pruefen?', 'local_only');
}
