const endpoints=[
 ["UI Provider Readiness Dashboard","http://localhost:3000/provider-readiness-dashboard"],
 ["UI Provider Invocation Readiness Preflight","http://localhost:3000/provider-invocation-readiness-preflight"],
 ["UI Provider Readiness Policy","http://localhost:3000/provider-readiness-policy"],
 ["API Provider Invocation Readiness Preflight","http://localhost:3000/api/provider-invocation-readiness-preflight"],
 ["API Provider Readiness Policy","http://localhost:3000/api/provider-readiness-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 24.2 Provider Readiness Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Readiness URLs sind erreichbar."); }
main();
