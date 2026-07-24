import { committeeRoles, type CommitteeRoleId } from './cmt-store';
import { createCommitteeQuestion, type CommitteeQuestion } from './cmt-intake';

export type CommitteeOpinion = {
  roleId: CommitteeRoleId;
  title: string;
  stance: 'support' | 'caution' | 'block' | 'needs-info';
  summary: string;
  concerns: string[];
  nextStep: string;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
};

export type CommitteeDeliberation = {
  phase: '110.2';
  label: 'Gremium Deliberation';
  question: CommitteeQuestion;
  opinions: CommitteeOpinion[];
  aggregate: {
    recommendation: 'proceed-dry-run' | 'revise-before-proceeding' | 'blocked';
    summary: string;
    mainRisks: string[];
    nextSteps: string[];
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

function opinionFor(roleId: CommitteeRoleId, question: CommitteeQuestion): CommitteeOpinion {
  const role = committeeRoles.find((item) => item.id === roleId);
  const title = role?.title ?? roleId;
  const highRisk = question.riskLevel === 'high';
  const mediumRisk = question.riskLevel === 'medium';

  const stance: CommitteeOpinion['stance'] = highRisk && (roleId === 'legal' || roleId === 'risk')
    ? 'caution'
    : mediumRisk && roleId === 'risk'
      ? 'caution'
      : 'support';

  const concernByRole: Record<CommitteeRoleId, string[]> = {
    strategy: ['Zielbild und Prioritaet muessen klar bleiben.'],
    legal: ['Rechtliche und regulatorische Freigaben pruefen.'],
    technical: ['Technische Abhaengigkeiten und Schnittstellen validieren.'],
    finance: ['Budget, Aufwand und Nutzen transparent bewerten.'],
    risk: ['Risiken, Annahmen und Gegenmassnahmen dokumentieren.'],
    execution: ['Konkrete naechste Schritte und Verantwortlichkeiten festlegen.'],
  };

  const nextStepByRole: Record<CommitteeRoleId, string> = {
    strategy: 'Entscheidungsziel und Erfolgskriterien schriftlich festlegen.',
    legal: 'Compliance-/Datenschutz-Check vor echter Ausfuehrung vorbereiten.',
    technical: 'Technische Machbarkeit und Integrationspunkte pruefen.',
    finance: 'Aufwandsschaetzung und Nutzenhypothese ergaenzen.',
    risk: 'Risikoliste mit Gegenmassnahmen erstellen.',
    execution: 'Umsetzungsplan mit kleinem naechsten Schritt definieren.',
  };

  return {
    roleId,
    title,
    stance,
    summary: title + ' bewertet die Frage im Dry-run und liefert eine interne Einschaetzung ohne Provider-Call.',
    concerns: concernByRole[roleId],
    nextStep: nextStepByRole[roleId],
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
  };
}

export function createCommitteeDeliberation(text: string): CommitteeDeliberation {
  const question = createCommitteeQuestion(text);
  const opinions = question.selectedRoleIds.map((roleId) => opinionFor(roleId, question));
  const cautionCount = opinions.filter((opinion) => opinion.stance === 'caution').length;
  const recommendation: CommitteeDeliberation['aggregate']['recommendation'] =
    question.riskLevel === 'high' || cautionCount > 1
      ? 'revise-before-proceeding'
      : 'proceed-dry-run';

  return {
    phase: '110.2',
    label: 'Gremium Deliberation',
    question,
    opinions,
    aggregate: {
      recommendation,
      summary: 'Das simulierte Gremium hat die Frage rollenbasiert bewertet. Ergebnis bleibt dry-run-only.',
      mainRisks: Array.from(new Set(opinions.flatMap((opinion) => opinion.concerns))),
      nextSteps: opinions.map((opinion) => opinion.nextStep),
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeDeliberationDemo() {
  return createCommitteeDeliberation('Soll unser Agent eine Nutzerfrage an ein internes Gremium routen und eine Empfehlung erstellen?');
}
