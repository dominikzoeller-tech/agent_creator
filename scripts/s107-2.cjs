const http = require('http');
const checks = [
  ['UI Dashboard', 'http://localhost:3000/p107-2-dash'],
  ['UI Policy Audit', 'http://localhost:3000/p107-1'],
  ['API Policy Audit', 'http://localhost:3000/api/p107-1'],
  ['API Health', 'http://localhost:7071/health'],
];
function get(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.setTimeout(5000, () => { req.destroy(); resolve('timeout'); });
    req.on('error', () => resolve(''));
  });
}
(async () => {
  let failed = false;
  for (const [label, url] of checks) {
    const status = await get(url);
    if (status === 200) console.log('OK  ', label + ':', status, url);
    else { console.log('FAIL', label + ':', status, url); failed = true; }
  }
  if (failed) process.exitCode = 1;
})();
