const endpoints=[
 ["UI Real Provider Gate Dashboard","http://localhost:3000/real-provider-gate-dashboard"],
 ["UI Controlled Real Provider Gate","http://localhost:3000/controlled-real-provider-invocation-gate"],
 ["UI Real Provider Gate Policy","http://localhost:3000/real-provider-gate-policy"],
 ["API Controlled Real Provider Gate","http://localhost:3000/api/controlled-real-provider-invocation-gate"],
 ["API Real Provider Gate Policy","http://localhost:3000/api/real-provider-gate-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 26.2 Real Provider Gate Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Real Provider Gate URLs sind erreichbar."); }
main();
