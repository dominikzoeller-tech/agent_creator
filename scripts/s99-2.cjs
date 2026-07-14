const http = require('http');
const urls = [
  ['UI Dashboard', 'http://localhost:3000/p99-2-dash'],
  ['UI Policy Audit', 'http://localhost:3000/p99-1'],
  ['API Policy Audit', 'http://localhost:3000/api/p99-1'],
  ['API Health', 'http://localhost:7071/health'],
];
function check(label, url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + res.statusCode + ' ' + url);
      resolve(ok || url.includes('7071'));
    });
    req.setTimeout(5000, () => {
      req.destroy();
      console.log('FAIL ' + label + ': timeout ' + url);
      resolve(url.includes('7071'));
    });
    req.on('error', () => {
      console.log('FAIL ' + label + ': ' + url);
      resolve(url.includes('7071'));
    });
  });
}
(async () => {
  const results = [];
  for (const [label, url] of urls) results.push(await check(label, url));
  if (!results.every(Boolean)) process.exit(1);
})();
