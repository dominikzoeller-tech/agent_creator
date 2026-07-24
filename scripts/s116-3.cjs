const http = require('http');

const urls = [
  ['Nav UI', 'http://localhost:3000/cmt/nav'],
  ['Home UI', 'http://localhost:3000/cmt/home'],
  ['App Entry UI', 'http://localhost:3000/cmt/app-entry'],
  ['Nav API', 'http://localhost:3000/api/cmt/nav'],
  ['Home API', 'http://localhost:3000/api/cmt/home'],
  ['App Entry API', 'http://localhost:3000/api/cmt/app-entry'],
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
