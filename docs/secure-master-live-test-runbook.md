# Secure Master Agent Live Test Runbook

## Status

The live-test path is prepared, but real provider calls must remain blocked until a conscious manual test.

## Before the first real call

1. Build must be green.
2. The agent page must load: /cmt/master/secure/agent
3. Secret/Git preflight must be green.
4. Budget/token preflight must be green.
5. Use only a harmless test question.
6. Do not send internal, customer, personal, confidential, or secret data.
7. Provider key must be server-side only in .env.local.
8. No provider key may appear in browser, localStorage, Git, logs, screenshots, or exported JSON.

## Manual .env.local setup

Copy values from .env.live-test.example to .env.local and then intentionally change only these fields for a real test:

LIVE_TEST_ENABLED=true
PROVIDER_ENABLED=true
LIVE_MODEL_ENABLED=true
EXTERNAL_SHARING_ALLOWED=true
PROVIDER_MODEL=<your model>
PROVIDER_API_KEY=<your server-side key>

Keep PROVIDER_DRY_RUN_ONLY=true until the final conscious test moment.

## Safe first test question

Antworte in einem Satz: Funktioniert dieser sichere Live-Test?

## After the test

Immediately set the live gates back to false unless you intentionally continue testing.
