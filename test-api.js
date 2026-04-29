
const http = require('http');

const data = JSON.stringify({ email: 'Youssefbennasser046@gmail.com', password: 'password' });

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Login Status:', res.statusCode);
    if(res.statusCode === 200) {
        console.log('Token:', body.substring(0,20)+'...');
    } else {
        console.log('Body:', body);
    }
  });
});

req.on('error', error => {
  console.error(error);
});
req.write(data);
req.end();

