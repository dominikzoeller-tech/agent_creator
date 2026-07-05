const endpoints = [
  ["UI Provider Dispatch Transcript Dashboard", "http://localhost:3000/provider-dispatch-transcript-envelope-dashboard"],
  ["UI Provider Dispatch Transcript Envelope", "http://localhost:3000/provider-dispatch-transcript-envelope"],
  ["UI Provider Dispatch Transcript Policy", "http://localhost:3000/provider-dispatch-transcript-envelope-policy"],
  ["API Provider Dispatch Transcript Envelope", "http://localhost:3000/api/provider-dispatch-transcript-envelope"],
  ["API Provider Dispatch Transcript Policy", "http://localhost:3000/api/provider-dispatch-transcript-envelope-policy"],
  ["API Health", "http://localhost:7071/health"],
];

async function main() {
  console.log("======================================");
  console.log(" Phase 39.2 Provider Dispatch Transcript Envelope Dashboard Smoke");
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
  if (!ok) { console.error("Smoke fehlgeschlagen."); process.exit(1); }
  console.log("Smoke OK. Provider Dispatch Transcript Envelope URLs sind erreichbar.");
}
main();
