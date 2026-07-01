const endpoints = [
  ["UI Agent Runtime", "http://localhost:3000/agent-runtime"],
  ["UI Runtime Consent", "http://localhost:3000/agent-runtime-consent"],
  ["UI Runtime Resume", "http://localhost:3000/agent-runtime-resume"],
  ["UI Runtime Policy", "http://localhost:3000/agent-runtime-policy"],
  ["UI Runtime Dashboard", "http://localhost:3000/agent-runtime-dashboard"],
  ["API Agent Runtime", "http://localhost:3000/api/agent-runtime"],
  ["API Runtime Consent", "http://localhost:3000/api/agent-runtime-consent"],
  ["API Runtime Resume", "http://localhost:3000/api/agent-runtime-resume"],
  ["API Runtime Policy", "http://localhost:3000/api/agent-runtime-policy"],
  ["API Governance Audit", "http://localhost:3000/api/governance-audit"],
  ["API Health", "http://localhost:7071/health"],
];
async function main(){
  console.log("======================================");
  console.log(" Phase 12.4 Runtime Dashboard Smoke");
  console.log("======================================");
  let ok=true;
  for(const entry of endpoints){
    const label = entry[0];
    const url = entry[1];
    try{
      const res = await fetch(url, { cache: "no-store" });
      const good = res.status >= 200 && res.status < 400;
      console.log((good ? "OK  " : "MISS") + " " + label + ": " + res.status + " " + url);
      if(!good) ok=false;
    } catch(error){
      console.log("MISS " + label + ": " + url);
      console.log(error instanceof Error ? error.message : String(error));
      ok=false;
    }
  }
  if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); }
  console.log("Smoke OK. Phase 12 Runtime URLs sind erreichbar.");
}
main();
