const endpoints=[
 ["UI Approval Token Request Dashboard","http://localhost:3000/approval-token-request-dashboard"],
 ["UI Human Approval Token Request","http://localhost:3000/human-approval-token-request"],
 ["UI Approval Token Request Policy","http://localhost:3000/approval-token-request-policy"],
 ["API Human Approval Token Request","http://localhost:3000/api/human-approval-token-request"],
 ["API Approval Token Request Policy","http://localhost:3000/api/approval-token-request-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 27.2 Approval Token Request Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Approval Token Request URLs sind erreichbar."); }
main();
