const endpoints=[
 ["UI Approval Token Activation Dashboard","http://localhost:3000/approval-token-activation-dashboard"],
 ["UI Approval Token Activation Gate","http://localhost:3000/approval-token-activation-gate"],
 ["UI Approval Token Activation Policy","http://localhost:3000/approval-token-activation-policy"],
 ["API Approval Token Activation Gate","http://localhost:3000/api/approval-token-activation-gate"],
 ["API Approval Token Activation Policy","http://localhost:3000/api/approval-token-activation-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 29.2 Approval Token Activation Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Approval Token Activation URLs sind erreichbar."); }
main();
