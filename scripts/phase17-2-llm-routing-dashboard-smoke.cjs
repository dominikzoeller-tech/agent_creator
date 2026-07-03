const endpoints=[
 ["UI LLM Routing Dashboard","http://localhost:3000/llm-routing-dashboard"],
 ["UI LLM Routing Envelope","http://localhost:3000/llm-routing-envelope"],
 ["UI LLM Routing Policy","http://localhost:3000/llm-routing-policy"],
 ["API LLM Routing Envelope","http://localhost:3000/api/llm-routing-envelope"],
 ["API LLM Routing Policy","http://localhost:3000/api/llm-routing-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 17.2 LLM Routing Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. LLM Routing URLs sind erreichbar."); }
main();
