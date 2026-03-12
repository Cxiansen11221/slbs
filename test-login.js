const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/admin/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify({
      username: 'admin',
      password: '123456'
    }))
  }
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(JSON.stringify({
  username: 'admin',
  password: '123456'
}));
req.end();