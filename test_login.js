// Test Login Script
const http = require('http');

console.log('🚀 Testing login for alice@example.com / password123');

const data = JSON.stringify({
    email: "alice@example.com",
    password: "password123"
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    console.log('NOTE: Ensure the server is running on port 3000');
});

req.write(data);
req.end();
