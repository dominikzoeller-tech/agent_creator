# mvp-agent-1

Central MVP agent screen for the Secure Master Agent.

This patch intentionally avoids the old pattern of many status/entry/handoff pages.

It adds:

- `frontend/lib/cmt-secure-master-agent-mvp.ts`
- `frontend/app/cmt/master/secure/agent/page.tsx`
- `scripts/mvp-agent-1.cjs`
- `scripts/v-mvp-agent-1.cjs`
- package scripts:
  - `mvp:verify`
  - `agent:mvp:verify`

Target route:

```text
/cmt/master/secure/agent
```

Still local only:

- no provider
- no internet
- no live model
- no external sharing
- browser-local logs only
