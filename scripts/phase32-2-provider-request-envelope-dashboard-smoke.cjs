const endpoints=[
 ["UI Provider Envelope Dashboard","http://localhost:3000/provider-request-envelope-dashboard"],
 ["UI Provider Request Envelope","http://localhost:3000/provider-request-envelope"],
 ["UI Provider Envelope Policy","http://localhost:3000/provider-request-envelope-policy"],
 ["API Provider Request Envelope","http://localhost:3000/api/provider-request-envelope"],
 ["API Provider Envelope Policy","http://localhost:3000/api/provider-request-envelope-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 32.2 Provider Request Envelope Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Request Envelope URLs sind erreichbar."); }
main();
