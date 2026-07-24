const http = require('http');

const urls = [
  ['Ask UI', 'http://localhost:3000/cmt/ask'],
  ['Run UI', 'http://localhost:3000/cmt/run'],
  ['View UI', 'http://localhost:3000/cmt/view'],
  ['Ask API', 'http://localhost:3000/api/cmt/ask'],
  ['Run API', 'http://localhost:3000/api/cmt/run'],
  ['View API', 'http://localhost:3000/api/cmt/view'],
];

function check(label, url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + res.statusCode + ' ' + url);
      resolve(ok);
    });
    req.on('error', () => {
      console.log('FAIL ' + label + ': ' + url);
      resolve(false);
    });
    req.setTimeout(8000, () => {
      req.destroy();
      console.log('FAIL ' + label + ': timeout ' + url);
      resolve(false);
    });
  });
}

(async () => {
  const results = [];
  for (const [label, url] of urls) results.push(await check(label, url));
  if (!results.every(Boolean)) process.exit(1);
})();
