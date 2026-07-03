const endpoints=[
 ["UI LLM Stub Dashboard","http://localhost:3000/llm-stub-dashboard"],
 ["UI LLM Stub Response","http://localhost:3000/llm-stub-response"],
 ["UI LLM Stub Policy","http://localhost:3000/llm-stub-policy"],
 ["API LLM Stub Response","http://localhost:3000/api/llm-stub-response"],
 ["API LLM Stub Policy","http://localhost:3000/api/llm-stub-policy"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 18.2 LLM Stub Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. LLM Stub URLs sind erreichbar."); }
main();
