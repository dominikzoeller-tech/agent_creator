const http = require('http');
const checks = [
  ['UI Dashboard', 'http://localhost:3000/p106-2-dash'],
  ['UI Policy Audit', 'http://localhost:3000/p106-1'],
  ['API Policy Audit', 'http://localhost:3000/api/p106-1'],
  ['API Health', 'http://localhost:7071/health'],
];
function get(url) {
  return new Promise(resolve => {
    const req = http.get(url, res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
    req.setTimeout(4000, () => { req.destroy(); resolve('timeout'); });
    req.on('error', () => resolve(''));
  });
}
(async () => {
  for (const [label, url] of checks) {
    const status = await get(url);
    const ok = status === 200;
    console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + status + ' ' + url);
  }
})();
