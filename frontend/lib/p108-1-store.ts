import { getP1080Boundary } from './p108-0-store';

export type P1081Audit = ReturnType<typeof getP1080Boundary> & {
  auditPhase: '108.1';
  auditLabel: string;
  policyAuditRecorded: true;
  policyAuditResult: 'locked';
};

export function getP1081Audit(): P1081Audit {
  const boundary = getP1080Boundary();
  return {
    ...boundary,
    auditPhase: '108.1',
    auditLabel: 'Seal Final Receipt Completion Final Closure Receipt Seal Boundary Policy Audit',
    policyAuditRecorded: true,
    policyAuditResult: 'locked',
  };
}
