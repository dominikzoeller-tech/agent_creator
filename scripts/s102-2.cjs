const http = require('http');
const checks = [
  ['UI Dashboard', 'http://localhost:3000/p102-2-dash'],
  ['UI Policy Audit', 'http://localhost:3000/p102-1'],
  ['API Policy Audit', 'http://localhost:3000/api/p102-1'],
  ['API Health', 'http://localhost:7071/health'],
];
function get(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode));
    });
    req.setTimeout(5000, () => { req.destroy(); resolve('timeout'); });
    req.on('error', () => resolve(''));
  });
}
(async () => {
  let failed = false;
  for (const [name, url] of checks) {
    const status = await get(url);
    if (status === 200) console.log('OK  ', name + ':', status, url);
    else { console.log('FAIL', name + ':', status, url); if (!String(url).includes(':7071/health')) failed = true; }
  }
  if (failed) process.exitCode = 1;
})();
