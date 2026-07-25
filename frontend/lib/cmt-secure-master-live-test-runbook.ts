export type SecureMasterLiveTestRunbook = {
  runbookPrepared: true;
  envExampleFile: '.env.live-test.example';
  docsFile: 'docs/secure-master-live-test-runbook.md';
  providerCallAllowedByThisPatch: false;
  clientSecretsAllowed: false;
  requiredManualSteps: string[];
  safeFirstQuestion: string;
  rollbackInstruction: string;
};

export const secureMasterLiveTestRunbook: SecureMasterLiveTestRunbook = {
  runbookPrepared: true,
  envExampleFile: '.env.live-test.example',
  docsFile: 'docs/secure-master-live-test-runbook.md',
  providerCallAllowedByThisPatch: false,
  clientSecretsAllowed: false,
  requiredManualSteps: [
    'npm run build muss gruen sein',
    'Secret/Git-Preflight pruefen',
    'Budget-Preflight pruefen',
    '.env.live-test.example manuell nach .env.local uebertragen',
    'serverseitigen PROVIDER_API_KEY setzen',
    'nur harmlose Testfrage verwenden',
    'nach Test Gates wieder deaktivieren',
  ],
  safeFirstQuestion: 'Antworte in einem Satz: Funktioniert dieser sichere Live-Test?',
  rollbackInstruction: 'Nach dem Test LIVE_TEST_ENABLED, PROVIDER_ENABLED, LIVE_MODEL_ENABLED und EXTERNAL_SHARING_ALLOWED wieder auf false setzen.',
};
