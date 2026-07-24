import { committeeRoles, type CommitteeRoleId } from './cmt-store';

export type CommitteeQuestion = {
  id: string;
  text: string;
  createdAt: string;
  topic: 'strategy' | 'legal' | 'technical' | 'finance' | 'risk' | 'execution' | 'general';
  riskLevel: 'low' | 'medium' | 'high';
  selectedRoleIds: CommitteeRoleId[];
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

const keywordMap: Array<[CommitteeQuestion['topic'], string[]]> = [
  ['legal', ['recht', 'vertrag', 'haftung', 'datenschutz', 'compliance', 'regulatorisch', 'gesetz']],
  ['technical', ['technik', 'architektur', 'api', 'build', 'code', 'system', 'integration', 'datenbank']],
  ['finance', ['kosten', 'budget', 'umsatz', 'preis', 'roi', 'finanz', 'cashflow']],
  ['risk', ['risiko', 'gefahr', 'sicherheit', 'ausfall', 'fehler', 'schaden', 'kritisch']],
  ['execution', ['umsetzung', 'plan', 'schritte', 'timeline', 'lieferung', 'projekt', 'roadmap']],
  ['strategy', ['strategie', 'ziel', 'markt', 'positionierung', 'prioritaet', 'vision']],
];

export function classifyCommitteeTopic(text: string): CommitteeQuestion['topic'] {
  const lower = text.toLowerCase();
  const match = keywordMap.find(([, words]) => words.some((word) => lower.includes(word)));
  return match ? match[0] : 'general';
}

export function assessCommitteeRisk(text: string): CommitteeQuestion['riskLevel'] {
  const lower = text.toLowerCase();
  const high = ['kritisch', 'haftung', 'verlust', 'illegal', 'sicherheitsluecke', 'produktiv', 'extern'];
  const medium = ['risiko', 'budget', 'vertrag', 'datenschutz', 'deadline', 'kunde'];
  if (high.some((word) => lower.includes(word))) return 'high';
  if (medium.some((word) => lower.includes(word))) return 'medium';
  return 'low';
}

export function selectCommitteeRoles(topic: CommitteeQuestion['topic'], riskLevel: CommitteeQuestion['riskLevel']): CommitteeRoleId[] {
  const base: CommitteeRoleId[] = ['strategy', 'technical', 'risk', 'execution'];
  if (topic !== 'general' && !base.includes(topic as CommitteeRoleId)) base.push(topic as CommitteeRoleId);
  if (riskLevel !== 'low' && !base.includes('legal')) base.push('legal');
  if ((topic === 'finance' || riskLevel === 'high') && !base.includes('finance')) base.push('finance');
  return committeeRoles.filter((role) => base.includes(role.id)).map((role) => role.id);
}

export function createCommitteeQuestion(text: string): CommitteeQuestion {
  const safeText = text.trim() || 'Welche Entscheidung soll das Gremium bewerten?';
  const topic = classifyCommitteeTopic(safeText);
  const riskLevel = assessCommitteeRisk(safeText);
  return {
    id: 'cq-demo-110-1',
    text: safeText,
    createdAt: 'dry-run',
    topic,
    riskLevel,
    selectedRoleIds: selectCommitteeRoles(topic, riskLevel),
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeIntakeDemo() {
  return createCommitteeQuestion('Soll unser Agent eine Nutzerfrage an ein internes Gremium routen?');
}
