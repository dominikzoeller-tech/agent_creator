# fix-privacy-decision-page-conflict

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Import declaration conflicts with local declaration of 'PrivacyDecisionOption'
```

Problem:

In dieser Datei:

```text
frontend/app/cmt/privacy/decision/page.tsx
```

steht gleichzeitig:

```ts
import type { PrivacyDecisionOption, PrivacyDecisionResult } from '../../../../lib/cmt-privacy-decision';
type PrivacyDecisionOption = ...
```

Dadurch ist `PrivacyDecisionOption` doppelt deklariert.

Fix:

Der Patch entfernt nur `PrivacyDecisionOption` aus dem Type-Import und laesst andere Imports wie `PrivacyDecisionResult` stehen.

Ausfuehren:

```powershell
node .\fix-privacy-decision-page-conflict\scripts\fix-privacy-decision-page-conflict.cjs
npm run fixprivacypage:verify
npm run build
```
