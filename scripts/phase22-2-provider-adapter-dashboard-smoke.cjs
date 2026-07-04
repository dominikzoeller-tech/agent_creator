const endpoints=[
 ["UI Provider Adapter Dashboard","http://localhost:3000/provider-llm-adapter-dashboard"],
 ["UI Provider Adapter Stub","http://localhost:3000/provider-llm-adapter-stub"],
 ["UI Provider Adapter Policy","http://localhost:3000/provider-llm-adapter-policy"],
 ["API Provider Adapter Stub","http://localhost:3000/api/provider-llm-adapter-stub"],
 ["API Provider Adapter Policy","http://localhost:3000/api/provider-llm-adapter-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 22.2 Provider Adapter Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Adapter URLs sind erreichbar."); }
main();
