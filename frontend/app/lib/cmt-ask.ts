/* Legacy ask compatibility module. */


// Legacy runtime compatibility export.
export function createCommitteeAskState(input: any = {}, options: any = {}): any {
  const prompt = typeof input === 'string' ? input : String(input?.prompt ?? input?.question ?? input?.input ?? '');
  return {
    ok: true,
    stub: true,
    phase: 'committee-ask-state-compat',
    prompt,
    input,
    options,
    status: 'ready',
    state: 'ready',
    localOnly: true,
    externalSharingAllowed: false,
    providerDispatchAllowed: false,
    networkCallAllowed: false,
    finalDispatchBlocked: true,
    selectedOption: 'local_only',
    committee: {
      enabled: true,
      roles: ['chair', 'privacy', 'tech', 'risk', 'quality'],
    },
    createdAt: new Date().toISOString(),
  };
}
