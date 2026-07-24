const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Select UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/filter/select'],
  ['Select Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/filter/select/status'],
  ['Select Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/filter/select/entry'],
  ['Select API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/filter/select'],
  ['Select Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/filter/select/status'],
  ['Select Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/filter/select/entry'],
];
function check(label, url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + res.statusCode + ' ' + url);
      resolve(ok);
    });
    req.on('error', () => { console.log('FAIL ' + label + ': ' + url); resolve(false); });
    req.setTimeout(8000, () => { req.destroy(); console.log('FAIL ' + label + ': timeout ' + url); resolve(false); });
  });
}
(async () => {
  const results = [];
  for (const [label, url] of urls) results.push(await check(label, url));
  if (!results.every(Boolean)) process.exit(1);
})();
