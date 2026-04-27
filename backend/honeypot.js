const express = require('express');
const app = express();
app.use(express.text({ type: '*/*', limit: '10mb' }));

app.use((req, res) => {
  console.log('\n=== INCOMING REQUEST ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('\n--- HEADERS ---');
  for (const [key, value] of Object.entries(req.headers)) {
    console.log(`${key}: ${value}`);
  }
  console.log('\n--- BODY (first 500 chars) ---');
  console.log(String(req.body || '').slice(0, 500));
  console.log('========================\n');

  // Return a minimal valid SOAP fault so the working backend doesn't crash
  res.status(500).set('Content-Type', 'text/xml').send(`<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>Honeypot: request captured</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`);
});

app.listen(3002, () => console.log('Honeypot listening on port 3002'));
