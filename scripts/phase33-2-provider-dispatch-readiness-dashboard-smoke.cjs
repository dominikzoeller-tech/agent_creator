const endpoints = [
  ["UI Provider Dispatch Dashboard", "http://localhost:3000/provider-dispatch-readiness-dashboard"],
  ["UI Provider Dispatch Readiness", "http://localhost:3000/provider-dispatch-readiness"],
  ["UI Provider Dispatch Policy", "http://localhost:3000/provider-dispatch-readiness-policy"],
  ["API Provider Dispatch Readiness", "http://localhost:3000/api/provider-dispatch-readiness"],
  ["API Provider Dispatch Policy", "http://localhost:3000/api/provider-dispatch-readiness-policy"],
  ["API Health", "http://localhost:7071/health"],
];

async function main() {
  console.log("======================================");
  console.log(" Phase 33.2 Provider Dispatch Readiness Dashboard Smoke");
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
  console.log("Smoke OK. Provider Dispatch Readiness URLs sind erreichbar.");
}
main();
