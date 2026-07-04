const endpoints=[
 ["UI Approval Token Issuance Dashboard","http://localhost:3000/approval-token-issuance-dashboard"],
 ["UI Approval Token Issuance Gate","http://localhost:3000/approval-token-issuance-gate"],
 ["UI Approval Token Issuance Policy","http://localhost:3000/approval-token-issuance-policy"],
 ["API Approval Token Issuance Gate","http://localhost:3000/api/approval-token-issuance-gate"],
 ["API Approval Token Issuance Policy","http://localhost:3000/api/approval-token-issuance-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 28.2 Approval Token Issuance Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; }catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Approval Token Issuance URLs sind erreichbar."); }
main();
