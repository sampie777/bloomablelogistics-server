// Thanks to: https://www.mattknight.io/blog/docker-healthchecks-in-distroless-node-js
const http = require('node:http');

const options = {hostname: 'localhost', port: process.env.PORT, path: '/api/v1/health', method: 'GET'};

http.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        if (body === "OK") {
            process.exit(0);
        }

        console.log('Unhealthy response received: ', body);
        process.exit(1);
    });
})
    .on('error', (err) => {
        console.log('Error: ', err);
        process.exit(1);
    })
    .end();
