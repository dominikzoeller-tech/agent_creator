const endpoints = [
  ["UI Tool Sandbox", "http://localhost:3000/tool-sandbox"],
  ["UI Tool Adapter Consent", "http://localhost:3000/tool-adapter-consent"],
  ["UI Tool Adapter Resume", "http://localhost:3000/tool-adapter-resume"],
  ["UI Tool Adapter Policy", "http://localhost:3000/tool-adapter-policy"],
  ["UI Tool Adapter Dashboard", "http://localhost:3000/tool-adapter-dashboard"],
  ["API Tool Adapters", "http://localhost:3000/api/tool-adapters"],
  ["API Tool Adapter Consent", "http://localhost:3000/api/tool-adapter-consent"],
  ["API Tool Adapter Resume", "http://localhost:3000/api/tool-adapter-resume"],
  ["API Tool Adapter Policy", "http://localhost:3000/api/tool-adapter-policy"],
  ["API Governance Audit", "http://localhost:3000/api/governance-audit"],
  ["API Health", "http://localhost:7071/health"],
];
async function main(){
  console.log("======================================");
  console.log(" Phase 13.4 Tool Adapter Dashboard Smoke");
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
  console.log("Smoke OK. Phase 13 Tool Adapter URLs sind erreichbar.");
}
main();
