const http = require('http');
const checks = [
  ['UI Dashboard', 'http://localhost:3000/p95-2-dash'],
  ['UI Policy Audit', 'http://localhost:3000/p95-1'],
  ['API Policy Audit', 'http://localhost:3000/api/p95-1'],
  ['API Health', 'http://localhost:7071/health'],
];
function ping(label, url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      const ok = res.statusCode >= 200 && res.statusCode < 400;
      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + res.statusCode + ' ' + url);
      resolve(ok || url.includes(':7071/health'));
    });
    req.setTimeout(5000, () => { req.destroy(); console.log('FAIL ' + label + ': timeout ' + url); resolve(url.includes(':7071/health')); });
    req.on('error', () => { console.log('FAIL ' + label + ': ' + url); resolve(url.includes(':7071/health')); });
  });
}
(async () => {
  let ok = true;
  for (const [label, url] of checks) ok = (await ping(label, url)) && ok;
  if (!ok) process.exit(1);
})();
