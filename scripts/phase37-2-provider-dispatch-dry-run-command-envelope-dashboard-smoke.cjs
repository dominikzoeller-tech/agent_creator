const endpoints=[
 ["UI Provider Dispatch Dry-Run Command Envelope Dashboard","http://localhost:3000/provider-dispatch-dry-run-command-envelope-dashboard"],
 ["UI Provider Dispatch Dry-Run Command Envelope","http://localhost:3000/provider-dispatch-dry-run-command-envelope"],
 ["UI Provider Dispatch Dry-Run Policy","http://localhost:3000/provider-dispatch-dry-run-command-envelope-policy"],
 ["API Provider Dispatch Dry-Run Command Envelope","http://localhost:3000/api/provider-dispatch-dry-run-command-envelope"],
 ["API Provider Dispatch Dry-Run Policy","http://localhost:3000/api/provider-dispatch-dry-run-command-envelope-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 37.2 Provider Dispatch Dry-Run Command Envelope Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Dispatch Dry-Run Command Envelope URLs sind erreichbar."); }
main();
