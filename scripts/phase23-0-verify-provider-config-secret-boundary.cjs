const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 23.0 Provider Config Secret Boundary Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-config-secret-boundary-store.ts",["createProviderConfigSecretBoundaryCheck","secret_boundary_presence_metadata_only","networkCallPerformed:false","providerExecutionAllowed:false","noSecretValuesStored:true","noSecretValuesExposed:true"])&&ok;
ok=check("frontend/app/api/provider-config-secret-boundary/route.ts",["createProviderConfigSecretBoundaryCheck","GET","POST"])&&ok;
ok=check("frontend/app/provider-config-secret-boundary/page.tsx",["Provider Config Secret Boundary","Provider Config Boundary prüfen","secretValuesStored","secretValuesExposed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-config-secret-boundary","Secret Boundary","provider-config-secret-boundary"])&&ok;
ok=check("phase23-0-provider-configuration-secret-boundary.md",["Phase 23.0","Provider Configuration & Secret Boundary","Phase 23.1","networkCallPerformed=false","providerExecutionAllowed=false"])&&ok;
ok=check("docs/phase23-provider-configuration-secret-boundary-runbook.md",["phase23:0:patch","phase23:0:verify","/provider-config-secret-boundary"])&&ok;
ok=check("package.json",["phase23:0:patch","phase23:0:verify","llm:provider-config:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 23.0 Provider Configuration & Secret Boundary ist vorbereitet.");
