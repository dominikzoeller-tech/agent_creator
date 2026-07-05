const endpoints = [
  ["UI Issuance Confirmation Dashboard", "http://localhost:3000/provider-dispatch-human-approval-token-issuance-confirmation-dashboard"],
  ["UI Issuance Confirmation Envelope", "http://localhost:3000/provider-dispatch-human-approval-token-issuance-confirmation"],
  ["UI Issuance Confirmation Policy", "http://localhost:3000/provider-dispatch-human-approval-token-issuance-confirmation-policy"],
  ["API Issuance Confirmation Envelope", "http://localhost:3000/api/provider-dispatch-human-approval-token-issuance-confirmation"],
  ["API Issuance Confirmation Policy", "http://localhost:3000/api/provider-dispatch-human-approval-token-issuance-confirmation-policy"],
  ["API Health", "http://localhost:7071/health"],
];

async function main() {
  console.log("======================================");
  console.log(" Phase 45.2 Provider Dispatch Human Approval Token Issuance Confirmation Dashboard Smoke");
  console.log("======================================");
  let ok = true;
  for (const [label, url] of endpoints) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const good = res.status >= 200 && res.status < 400;
      console.log((good ? "OK  " : "MISS") + " " + label + ": " + res.status + " " + url);
      if (!good) ok = false;
    } catch (error) {
      console.log("MISS " + label + ": " + url);
      console.log(error instanceof Error ? error.message : String(error));
      ok = false;
    }
  }
  if (!ok) {
    console.error("Smoke fehlgeschlagen.");
    process.exit(1);
  }
  console.log("Smoke OK. Provider Dispatch Human Approval Token Issuance Confirmation URLs sind erreichbar.");
}

main();
