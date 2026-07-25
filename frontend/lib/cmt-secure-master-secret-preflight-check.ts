export type SecureMasterSecretPreflightResult = {
  ok: boolean;
  checkedAt: string;
  realSecretsRead: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  envExampleExists: boolean;
  gitIgnoreExists: boolean;
  gitIgnoreCoversEnv: boolean;
  gitIgnoreCoversKeys: boolean;
  requiredBeforeLive: string[];
  warnings: string[];
  nextSafeStep: string;
};

export function createSecureMasterSecretPreflightResult(params: {
  envExampleExists: boolean;
  gitIgnoreExists: boolean;
  gitIgnoreText: string;
}): SecureMasterSecretPreflightResult {
  const gitIgnoreText = params.gitIgnoreText.toLowerCase();
  const gitIgnoreCoversEnv = gitIgnoreText.includes('.env') || gitIgnoreText.includes('.env.*');
  const gitIgnoreCoversKeys = gitIgnoreText.includes('*.key') || gitIgnoreText.includes('secret') || gitIgnoreText.includes('*secret*');
  const warnings: string[] = [];

  if (!params.envExampleExists) warnings.push('.env.example fehlt oder ist nicht lesbar.');
  if (!params.gitIgnoreExists) warnings.push('.gitignore fehlt oder ist nicht lesbar.');
  if (!gitIgnoreCoversEnv) warnings.push('.gitignore deckt .env-Dateien noch nicht eindeutig ab.');
  if (!gitIgnoreCoversKeys) warnings.push('.gitignore deckt Key-/Secret-Dateien noch nicht eindeutig ab.');

  return {
    ok: warnings.length === 0,
    checkedAt: new Date().toISOString(),
    realSecretsRead: false,
    providerCallAllowed: false,
    liveModelEnabled: false,
    envExampleExists: params.envExampleExists,
    gitIgnoreExists: params.gitIgnoreExists,
    gitIgnoreCoversEnv,
    gitIgnoreCoversKeys,
    requiredBeforeLive: [
      '.env.example ohne echte Werte vorhanden',
      '.gitignore blockiert .env und Secret-Dateien',
      'echte API-Keys nur serverseitig und nie im Client',
      'keine echten Secrets im Repo',
      'Provider bleibt deaktiviert bis manueller Live-Test-Schalter aktiv ist',
    ],
    warnings,
    nextSafeStep: warnings.length === 0
      ? 'Secret/Git-Preflight ist lokal gruener. Als naechstes Budget-/Token-Limit vorbereiten.'
      : 'Warnungen beheben, bevor ein Live-Test-Schalter vorbereitet wird.',
  };
}
