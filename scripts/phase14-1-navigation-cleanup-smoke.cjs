const endpoints = [
  ["UI Master Cockpit", "http://localhost:3000/master-cockpit"],
  ["UI Chat", "http://localhost:3000/"],
  ["UI Approvals", "http://localhost:3000/tool-consent"],
  ["UI Audit", "http://localhost:3000/governance-audit"],
  ["UI Agent Registry", "http://localhost:3000/agent-registry"],
  ["UI Runtime Dashboard", "http://localhost:3000/agent-runtime-dashboard"],
  ["UI Tool Dashboard", "http://localhost:3000/tool-adapter-dashboard"],
  ["API Health", "http://localhost:7071/health"],
];
async function main(){
  console.log("======================================");
  console.log(" Phase 14.1 Navigation Cleanup Smoke");
  console.log("======================================");
  let ok=true;
  for(const [label,url] of endpoints){
    try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }
    catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; }
  }
  if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); }
  console.log("Smoke OK. Navigation Cleanup URLs sind erreichbar.");
}
main();
