const endpoints = [
  ["UI Approval Policy Confirmation Dashboard", "http://localhost:3000/provider-dispatch-approval-policy-confirmation-dashboard"],
  ["UI Approval Policy Confirmation Envelope", "http://localhost:3000/provider-dispatch-approval-policy-confirmation-envelope"],
  ["UI Approval Policy Confirmation Policy", "http://localhost:3000/provider-dispatch-approval-policy-confirmation-policy"],
  ["API Approval Policy Confirmation Envelope", "http://localhost:3000/api/provider-dispatch-approval-policy-confirmation-envelope"],
  ["API Approval Policy Confirmation Policy", "http://localhost:3000/api/provider-dispatch-approval-policy-confirmation-policy"],
  ["API Health", "http://localhost:7071/health"],
];

async function main() {
  console.log("======================================");
  console.log(" Phase 42.2 Provider Dispatch Approval Policy Confirmation Dashboard Smoke");
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
  console.log("Smoke OK. Provider Dispatch Approval Policy Confirmation URLs sind erreichbar.");
}

main();
