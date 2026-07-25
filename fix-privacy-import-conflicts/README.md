# fix-privacy-import-conflicts

Fix fuer aktuellen TypeScript-Fehler:

```text
Import declaration conflicts with local declaration of 'PrivacyDecisionOption'
```

Problem-Datei aktuell:

```text
frontend/app/api/cmt/privacy/decision/route.ts
```

Dort steht ein Mixed Import:

```ts
import { decidePrivacyAction, getPrivacyDecisionDemo, type PrivacyDecisionOption } from '../../../../../lib/cmt-privacy-decision';
```

und gleichzeitig wurde lokal schon ein Type gesetzt:

```ts
type PrivacyDecisionOption = ...
```

Dieser Patch entfernt `type PrivacyDecisionOption` aus gemischten Imports, laesst normale Funktionsimports aber stehen.

Ausfuehren:

```powershell
node .\fix-privacy-import-conflicts\scripts\fix-privacy-import-conflicts.cjs
npm run fixprivacyimports:verify
npm run build
```
