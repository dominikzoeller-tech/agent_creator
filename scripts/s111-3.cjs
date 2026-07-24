const http = require('http');

const urls = [
  ['Session UI', 'http://localhost:3000/cmt/session'],
  ['Result UI', 'http://localhost:3000/cmt/result'],
  ['Brief UI', 'http://localhost:3000/cmt/brief'],
  ['Session API', 'http://localhost:3000/api/cmt/session'],
  ['Result API', 'http://localhost:3000/api/cmt/result'],
  ['Brief API', 'http://localhost:3000/api/cmt/brief'],
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
