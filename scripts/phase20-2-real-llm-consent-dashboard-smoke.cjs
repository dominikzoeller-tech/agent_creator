const endpoints=[
 ["UI Real LLM Consent Dashboard","http://localhost:3000/real-llm-consent-dashboard"],
 ["UI Real LLM Consent","http://localhost:3000/real-llm-consent"],
 ["UI Real LLM Consent Decision","http://localhost:3000/real-llm-consent-decision"],
 ["API Real LLM Consent","http://localhost:3000/api/real-llm-consent"],
 ["API Real LLM Consent Decision","http://localhost:3000/api/real-llm-consent-decision"],
 ["API Health","http://localhost:7071/health"]
];
async function main(){ console.log("======================================"); console.log(" Phase 20.2 Real LLM Consent Dashboard Smoke"); console.log("======================================"); let ok=true; for(const [label,url] of endpoints){ try{ const res=await fetch(url,{cache:"no-store"}); const good=res.status>=200&&res.status<400; console.log((good?"OK  ":"MISS")+" "+label+": "+res.status+" "+url); if(!good) ok=false; } catch(error){ console.log("MISS "+label+": "+url); console.log(error instanceof Error?error.message:String(error)); ok=false; } } if(!ok){ console.error("Smoke fehlgeschlagen."); process.exit(1); } console.log("Smoke OK. Real LLM Consent URLs sind erreichbar."); }
main();
