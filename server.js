const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

// Load SSL certificate files
const privateKey = fs.readFileSync('/home/ubuntu/BarIlan/private.key ', 'utf8');
const certificate = fs.readFileSync('/home/ubuntu/BarIlan/certificate.crt ', 'utf8');
const caBundle = fs.readFileSync('/home/ubuntu/BarIlan/ca_bundle.crt', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: caBundle,
};

// Serve static React build files
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Listen on port 443 (default HTTPS port)
httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
