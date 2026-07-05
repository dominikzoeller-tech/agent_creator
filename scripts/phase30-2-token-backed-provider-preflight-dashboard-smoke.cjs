const endpoints=[
 ["UI Token Provider Dashboard","http://localhost:3000/token-backed-provider-preflight-dashboard"],
 ["UI Token Provider Preflight","http://localhost:3000/token-backed-provider-invocation-preflight"],
 ["UI Token Provider Policy","http://localhost:3000/token-backed-provider-preflight-policy"],
 ["API Token Provider Preflight","http://localhost:3000/api/token-backed-provider-invocation-preflight"],
 ["API Token Provider Policy","http://localhost:3000/api/token-backed-provider-preflight-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 30.2 Token-Backed Provider Preflight Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Token-backed Provider URLs sind erreichbar."); }
main();
