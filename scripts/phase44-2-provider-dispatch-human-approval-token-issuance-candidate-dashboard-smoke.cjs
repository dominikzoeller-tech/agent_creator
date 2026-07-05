const endpoints = [
  ["UI Issuance Candidate Dashboard", "http://localhost:3000/provider-dispatch-human-approval-token-issuance-candidate-dashboard"],
  ["UI Issuance Candidate Envelope", "http://localhost:3000/provider-dispatch-human-approval-token-issuance-candidate"],
  ["UI Issuance Candidate Policy", "http://localhost:3000/provider-dispatch-human-approval-token-issuance-candidate-policy"],
  ["API Issuance Candidate Envelope", "http://localhost:3000/api/provider-dispatch-human-approval-token-issuance-candidate"],
  ["API Issuance Candidate Policy", "http://localhost:3000/api/provider-dispatch-human-approval-token-issuance-candidate-policy"],
  ["API Health", "http://localhost:7071/health"],
];

async function main() {
  console.log("======================================");
  console.log(" Phase 44.2 Provider Dispatch Human Approval Token Issuance Candidate Dashboard Smoke");
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
  console.log("Smoke OK. Provider Dispatch Human Approval Token Issuance Candidate URLs sind erreichbar.");
}

main();
