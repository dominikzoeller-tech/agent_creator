const endpoints = [
  ["UI Human Approval Token Dashboard", "http://localhost:3000/provider-dispatch-human-approval-token-dashboard"],
  ["UI Human Approval Token Envelope", "http://localhost:3000/provider-dispatch-human-approval-token-envelope"],
  ["UI Human Approval Token Policy", "http://localhost:3000/provider-dispatch-human-approval-token-policy"],
  ["API Human Approval Token Envelope", "http://localhost:3000/api/provider-dispatch-human-approval-token-envelope"],
  ["API Human Approval Token Policy", "http://localhost:3000/api/provider-dispatch-human-approval-token-policy"],
  ["API Health", "http://localhost:7071/health"],
];

async function main() {
  console.log("======================================");
  console.log(" Phase 43.2 Provider Dispatch Human Approval Token Dashboard Smoke");
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
  console.log("Smoke OK. Provider Dispatch Human Approval Token URLs sind erreichbar.");
}

main();
