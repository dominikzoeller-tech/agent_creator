const endpoints = [
  ["UI RC Dashboard", "http://localhost:3000/provider-dispatch-release-candidate-envelope-dashboard"],
  ["UI RC Envelope", "http://localhost:3000/provider-dispatch-release-candidate-envelope"],
  ["UI RC Policy", "http://localhost:3000/provider-dispatch-release-candidate-envelope-policy"],
  ["API RC Envelope", "http://localhost:3000/api/provider-dispatch-release-candidate-envelope"],
  ["API RC Policy", "http://localhost:3000/api/provider-dispatch-release-candidate-envelope-policy"],
  ["API Health", "http://localhost:7071/health"],
];

async function main() {
  console.log("======================================");
  console.log(" Phase 40.2 Provider Dispatch Release Candidate Envelope Dashboard Smoke");
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
  console.log("Smoke OK. Provider Dispatch Release Candidate Envelope URLs sind erreichbar.");
}

main();
