const endpoints=[
 ["UI Invocation Envelope Dashboard","http://localhost:3000/approved-real-llm-invocation-envelope-dashboard"],
 ["UI Invocation Envelope","http://localhost:3000/approved-real-llm-invocation-envelope"],
 ["UI Invocation Envelope Policy","http://localhost:3000/approved-real-llm-invocation-envelope-policy"],
 ["API Invocation Envelope","http://localhost:3000/api/approved-real-llm-invocation-envelope"],
 ["API Invocation Envelope Policy","http://localhost:3000/api/approved-real-llm-invocation-envelope-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 21.2 Invocation Envelope Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Invocation Envelope URLs sind erreichbar."); }
main();
