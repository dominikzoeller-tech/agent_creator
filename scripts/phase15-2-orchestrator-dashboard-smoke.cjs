const endpoints=[
 ["UI Master Cockpit","http://localhost:3000/master-cockpit"],
 ["UI Master Orchestrator Dashboard","http://localhost:3000/master-orchestrator-dashboard"],
 ["UI Master Orchestrator","http://localhost:3000/master-orchestrator"],
 ["UI Master Orchestrator Policy","http://localhost:3000/master-orchestrator-policy"],
 ["API Cockpit Actions","http://localhost:3000/api/cockpit-actions"],
 ["API Master Orchestrator","http://localhost:3000/api/master-orchestrator"],
 ["API Master Orchestrator Policy","http://localhost:3000/api/master-orchestrator-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 15.2 Orchestrator Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Orchestrator Dashboard URLs sind erreichbar."); }
main();
