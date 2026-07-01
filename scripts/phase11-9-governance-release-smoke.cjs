const endpoints = [
  ["UI Chat", "http://localhost:3000/"],
  ["UI Tool Consent", "http://localhost:3000/tool-consent"],
  ["UI Capability Requests", "http://localhost:3000/capability-requests"],
  ["UI Agent Blueprints", "http://localhost:3000/agent-blueprints"],
  ["UI Agent Registry", "http://localhost:3000/agent-registry"],
  ["UI Governance Audit", "http://localhost:3000/governance-audit"],
  ["API Health", "http://localhost:7071/health"],
  ["API Tool Consent", "http://localhost:3000/api/tool-consent"],
  ["API Capability Requests", "http://localhost:3000/api/capability-requests"],
  ["API Agent Blueprints", "http://localhost:3000/api/agent-blueprints"],
  ["API Agent Registry", "http://localhost:3000/api/agent-registry"],
  ["API Governance Audit", "http://localhost:3000/api/governance-audit"],
];
async function main(){
  console.log("======================================");
  console.log(" Phase 11.9 Governance Release Smoke");
  console.log("======================================");
  let ok=true;
  for(const [label, url] of endpoints){
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
  console.log("Smoke OK. Governance Release URLs sind erreichbar.");
}
main();
