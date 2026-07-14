const http = require('http');
const checks = [
  ['UI Dashboard', 'http://localhost:3000/p104-2-dash'],
  ['UI Policy Audit', 'http://localhost:3000/p104-1'],
  ['API Policy Audit', 'http://localhost:3000/api/p104-1'],
  ['API Health', 'http://localhost:7071/health'],
];
function get(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
    req.setTimeout(5000, () => { req.destroy(); resolve('timeout'); });
    req.on('error', () => resolve(''));
  });
}
(async () => {
  let failed = false;
  for (const [label, url] of checks) {
    const status = await get(url);
    const ok = status === 200;
    console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + status + ' ' + url);
    if (!ok && !url.includes('7071')) failed = true;
  }
  if (failed) process.exit(1);
})();
