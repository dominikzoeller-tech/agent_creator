const http = require('http');

const urls = [
  ['Master UI', 'http://localhost:3000/cmt/master'],
  ['Master Status UI', 'http://localhost:3000/cmt/master/status'],
  ['Master Entry UI', 'http://localhost:3000/cmt/master/entry'],
  ['Master API', 'http://localhost:3000/api/cmt/master'],
  ['Master Status API', 'http://localhost:3000/api/cmt/master/status'],
  ['Master Entry API', 'http://localhost:3000/api/cmt/master/entry'],
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
