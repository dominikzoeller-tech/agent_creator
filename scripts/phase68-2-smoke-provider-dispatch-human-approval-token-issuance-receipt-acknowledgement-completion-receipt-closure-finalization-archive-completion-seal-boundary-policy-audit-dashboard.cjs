const http = require('http');
const checks = [
  ['UI Archive Completion Seal Boundary Policy Audit Dashboard', 'http://localhost:3000/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-seal-boundary-policy-audit-dashboard'],
  ['UI Archive Completion Seal Boundary Policy Audit', 'http://localhost:3000/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-seal-boundary-policy-audit'],
  ['UI Archive Completion Seal Boundary', 'http://localhost:3000/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-seal-boundary'],
  ['API Archive Completion Seal Boundary Policy Audit', 'http://localhost:3000/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-seal-boundary-policy-audit'],
  ['API Archive Completion Seal Boundary', 'http://localhost:3000/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-seal-boundary'],
  ['API Health', 'http://localhost:7071/health'],
];
function get(url) { return new Promise((resolve, reject) => { const req = http.get(url, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); }); req.on('error', reject); req.setTimeout(8000, () => req.destroy(new Error('timeout'))); }); }
(async () => {
  let failed = false;
  for (const [name, url] of checks) {
    try { const status = await get(url); if (status >= 200 && status < 400) console.log('OK   ' + name + ': ' + status + ' ' + url); else { console.error('FAIL ' + name + ': ' + status + ' ' + url); failed = true; } }
    catch (err) { console.error('FAIL ' + name + ': ' + err.message + ' ' + url); failed = true; }
  }
  if (failed) process.exit(1);
  console.log('Smoke OK. Phase 68.2 URLs reachable.');
})();
