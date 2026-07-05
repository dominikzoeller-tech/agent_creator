const endpoints=[
 ["UI Provider Dispatch Dry-Run Result Envelope Dashboard","http://localhost:3000/provider-dispatch-dry-run-result-envelope-dashboard"],
 ["UI Provider Dispatch Dry-Run Result Envelope","http://localhost:3000/provider-dispatch-dry-run-result-envelope"],
 ["UI Provider Dispatch Dry-Run Result Policy","http://localhost:3000/provider-dispatch-dry-run-result-envelope-policy"],
 ["API Provider Dispatch Dry-Run Result Envelope","http://localhost:3000/api/provider-dispatch-dry-run-result-envelope"],
 ["API Provider Dispatch Dry-Run Result Policy","http://localhost:3000/api/provider-dispatch-dry-run-result-envelope-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 38.2 Provider Dispatch Dry-Run Result Envelope Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Dispatch Dry-Run Result Envelope URLs sind erreichbar."); }
main();
