# mvp-agent-ui-fix

Purpose:

- stabilize the central Secure Master Agent MVP page
- repair German umlauts / text encoding by rewriting the page as UTF-8
- keep the import relative so Next resolves it reliably
- recreate the missing MVP lib
- add compatibility fallback libs for old routes that currently break `npm run build`

Run from project root:

```powershell
node .\mvp-agent-ui-fix\scripts\mvp-agent-ui-fix.cjs
node scripts\v-mvp-agent-ui-fix.cjs
npm run build
```

Then test:

```text
http://localhost:3000/cmt/master/secure/agent
```
