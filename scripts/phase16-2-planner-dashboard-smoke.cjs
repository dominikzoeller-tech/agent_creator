const endpoints=[
 ["UI Master Planner Dashboard","http://localhost:3000/master-planner-dashboard"],
 ["UI Master Planner","http://localhost:3000/master-planner"],
 ["UI Master Planner Policy","http://localhost:3000/master-planner-policy"],
 ["API Master Planner","http://localhost:3000/api/master-planner"],
 ["API Master Planner Policy","http://localhost:3000/api/master-planner-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 16.2 Planner Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Planner Dashboard URLs sind erreichbar."); }
main();
