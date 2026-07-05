const endpoints=[
 ["UI Provider Dispatch Execution Gate Dashboard","http://localhost:3000/provider-dispatch-execution-gate-dashboard"],
 ["UI Provider Dispatch Execution Gate","http://localhost:3000/provider-dispatch-execution-gate"],
 ["UI Provider Dispatch Execution Policy","http://localhost:3000/provider-dispatch-execution-gate-policy"],
 ["API Provider Dispatch Execution Gate","http://localhost:3000/api/provider-dispatch-execution-gate"],
 ["API Provider Dispatch Execution Policy","http://localhost:3000/api/provider-dispatch-execution-gate-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 36.2 Provider Dispatch Execution Gate Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Dispatch Execution Gate URLs sind erreichbar."); }
main();
