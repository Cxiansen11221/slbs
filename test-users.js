const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/admin/users',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Body:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();