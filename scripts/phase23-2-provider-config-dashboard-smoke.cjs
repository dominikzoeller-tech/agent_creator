const endpoints=[
 ["UI Provider Config Dashboard","http://localhost:3000/provider-config-dashboard"],
 ["UI Provider Config Secret Boundary","http://localhost:3000/provider-config-secret-boundary"],
 ["UI Provider Config Policy","http://localhost:3000/provider-config-policy"],
 ["API Provider Config Secret Boundary","http://localhost:3000/api/provider-config-secret-boundary"],
 ["API Provider Config Policy","http://localhost:3000/api/provider-config-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 23.2 Provider Config Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Provider Config URLs sind erreichbar."); }
main();
