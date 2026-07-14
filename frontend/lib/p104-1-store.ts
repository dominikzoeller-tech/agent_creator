import { getP1040Boundary } from './p104-0-store';

export type P1041Audit = ReturnType<typeof getP1040Boundary> & {
  auditPhase: '104.1';
  auditLabel: string;
  policyAuditRecorded: true;
  externalProviderReviewRequired: false;
  externalDataTransferAllowed: false;
};

export function getP1041Audit(): P1041Audit {
  const boundary = getP1040Boundary();
  return {
    ...boundary,
    auditPhase: '104.1',
    auditLabel: 'Seal Final Closure Final Receipt Seal Final Receipt Boundary Policy Audit',
    policyAuditRecorded: true,
    externalProviderReviewRequired: false,
    externalDataTransferAllowed: false,
  };
}
