const http = require('http');
const urls = [
  ['UI Dashboard', 'http://localhost:3000/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit-dashboard'],
  ['UI Policy Audit', 'http://localhost:3000/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit'],
  ['UI Boundary', 'http://localhost:3000/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary'],
  ['API Policy Audit', 'http://localhost:3000/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit'],
  ['API Boundary', 'http://localhost:3000/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary'],
  ['API Health', 'http://localhost:7071/health']
];
function check(name, url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + ': ' + res.statusCode + ' ' + url);
      res.resume();
      resolve(ok);
    });
    req.on('error', () => { console.log('FAIL ' + name + ': ' + url); resolve(false); });
    req.setTimeout(3000, () => { req.destroy(); console.log('FAIL ' + name + ': timeout ' + url); resolve(false); });
  });
}
(async () => {
  let ok = true;
  for (const [name, url] of urls) {
    const result = await check(name, url);
    if (name !== 'API Health') ok = ok && result;
  }
  if (!ok) process.exitCode = 1;
})();
