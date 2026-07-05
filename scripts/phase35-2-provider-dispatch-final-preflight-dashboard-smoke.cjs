const endpoints=[
 ["UI Provider Dispatch Final Preflight Dashboard","http://localhost:3000/provider-dispatch-final-preflight-dashboard"],
 ["UI Provider Dispatch Final Preflight","http://localhost:3000/provider-dispatch-final-preflight"],
 ["UI Provider Dispatch Final Policy","http://localhost:3000/provider-dispatch-final-preflight-policy"],
 ["API Provider Dispatch Final Preflight","http://localhost:3000/api/provider-dispatch-final-preflight"],
 ["API Provider Dispatch Final Policy","http://localhost:3000/api/provider-dispatch-final-preflight-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 35.2 Provider Dispatch Final Preflight Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Dispatch Final Preflight URLs sind erreichbar."); }
main();
