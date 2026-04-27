const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const XOR_KEY = [0x50, 0x58, 0x50, 0x32, 0x30, 0x31, 0x34]; // "PXP2014"

function xorEncrypt(plaintext) {
  const bytes = Buffer.from(plaintext, 'utf8');
  const result = Buffer.alloc(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    result[i] = bytes[i] ^ XOR_KEY[i % XOR_KEY.length];
  }
  return result.toString('base64');
}

function extractPassword(xml) {
  const match = xml.match(/<password>([\s\S]*?)<\/password>/i);
  return match ? match[1] : null;
}

function replacePassword(xml, newPassword) {
  return xml.replace(/(<password>)([\s\S]*?)(<\/password>)/i, `$1${newPassword}$3`);
}

// XOR is its own inverse — decrypting uses the same operation as encrypting
function xorDecrypt(base64encrypted) {
  const bytes = Buffer.from(base64encrypted, 'base64');
  const result = Buffer.alloc(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    result[i] = bytes[i] ^ XOR_KEY[i % XOR_KEY.length];
  }
  return result.toString('utf8');
}

const MCPS_GRADING_SCALE = {
  default: {
    finals: {
      show: false,
      categories: [
        { mp: 1, courseIndex: null, weight: 0.25, type: 'course' },
        { mp: 3, courseIndex: null, weight: 0.25, type: 'course' },
        { mp: 5, courseIndex: null, weight: 0.25, type: 'course' },
        { mp: 7, courseIndex: null, weight: 0.25, type: 'course' },
      ],
      semesters: [
        { show: true, categories: [{ mp: 1, courseIndex: null, weight: 0.5, type: 'course' }, { mp: 3, courseIndex: null, weight: 0.5, type: 'course' }] },
        { show: true, categories: [{ mp: 5, courseIndex: null, weight: 0.5, type: 'course' }, { mp: 7, courseIndex: null, weight: 0.5, type: 'course' }] },
      ],
    },
    rounding: { percent: true, percentPlaces: 2, mark: false, markPlaces: 0 },
    letterScale: [
      ['A', [89.5, 100]], ['B', [79.5, 89.49]], ['C', [69.5, 79.49]],
      ['D', [59.5, 69.49]], ['E', [0, 59.49]],
    ],
  },
  mode: 'mcps',
};

const DEFAULT_GRADING_SCALE = {
  default: {
    rounding: { percent: true, percentPlaces: 2, mark: false, markPlaces: 0 },
    letterScale: [
      ['A', [89.5, 100]], ['B', [79.5, 89.49]], ['C', [69.5, 79.49]],
      ['D', [59.5, 69.49]], ['E', [0, 59.49]],
    ],
  },
};

// Cookie jar — seeded with the known MCPS edupointkeyversion static key
const cookieJar = {
  'md-mcps-psv.edupoint.com': { edupointkeyversion: 'Q6Fusi7HE4VYK+FDcmJAWCK/yGX0Chiu3mujH4sBjaA=' }
};

function getStoredCookies(hostname) {
  const jar = cookieJar[hostname];
  if (!jar) return '';
  return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
}

function storeCookies(hostname, setCookieHeaders) {
  if (!setCookieHeaders) return;
  // getSetCookie() returns proper array; fall back to splitting the joined string
  const headers = Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : setCookieHeaders.split(/,\s*(?=[A-Za-z0-9_-]+=)/);
  if (!cookieJar[hostname]) cookieJar[hostname] = {};
  for (const h of headers) {
    const [pair] = h.split(';');
    const eq = pair.indexOf('=');
    if (eq > 0) {
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      cookieJar[hostname][name] = value;
      console.log(`Stored cookie [${hostname}]: ${name}`);
    }
  }
}

const WARMUP_XML = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ProcessWebServiceRequestMultiWeb xmlns="http://edupoint.com/webservices/"><userID>warmup</userID><password>warmup</password><skipLoginLog>1</skipLoginLog><parent>0</parent><webServiceHandleName>PXPWebServices</webServiceHandleName><methodName>Gradebook</methodName><paramStr>&lt;Parms&gt;&lt;/Parms&gt;</paramStr></ProcessWebServiceRequestMultiWeb></soap:Body></soap:Envelope>`;

async function warmUpCookies(serviceUrl) {
  try {
    const hostname = new URL(serviceUrl).hostname;
    const res = await fetch(serviceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'User-Agent': 'axios/1.10.0',
        'Accept': 'application/json, text/plain, */*',
      },
      body: WARMUP_XML,
    });
    const setCookie = res.headers.getSetCookie?.() ?? res.headers.get('set-cookie');
    const body = await res.text();
    console.log('Warmup status:', res.status, '| Set-Cookie:', setCookie);
    console.log('Warmup body (first 600):', body.slice(0, 600));
    storeCookies(hostname, setCookie);
  } catch (err) {
    console.error('Warmup failed:', err.message);
  }
}

async function soapRequest(targetUrl, xml) {
  const hostname = new URL(targetUrl).hostname;
  const cookie = getStoredCookies(hostname);
  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      'User-Agent': 'axios/1.10.0',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, compress, deflate, br',
      ...(cookie ? { 'Cookie': cookie } : {}),
    },
    body: xml,
  });
  const setCookies = response.headers.getSetCookie?.() ?? response.headers.get('set-cookie');
  storeCookies(hostname, setCookies);
  const text = await response.text();
  return { status: response.status, ok: response.ok, text };
}

// Main SOAP proxy
app.post('/fulfillAxios', async (req, res) => {
  let { url, xml, encrypted } = req.body;

  if (!url || !xml) return res.json({ status: false, message: 'Missing url or xml' });

  // MCPS expects plain passwords. If encrypted=true (remember-me), decrypt back to plain first.
  if (encrypted) {
    const enc = extractPassword(xml);
    if (enc) xml = replacePassword(xml, xorDecrypt(enc));
  }

  const isMCPS = url.includes('md-mcps-psv.edupoint.com');

  try {
    let { status, ok, text } = await soapRequest(url, xml);

    // UPD5304 means our cookie is missing/stale — GET the service page to acquire a fresh one
    if (text.includes('UPD5304')) {
      await warmUpCookies(url);
      ({ status, ok, text } = await soapRequest(url, xml));
    }

    if (!ok && status !== 500) {
      return res.json({ status: false, message: `Upstream HTTP error: ${status}` });
    }

    return res.json({
      status: true,
      response: text,
      gradingScale: isMCPS ? MCPS_GRADING_SCALE : DEFAULT_GRADING_SCALE,
      token: null,
    });
  } catch (err) {
    console.error('fulfillAxios error:', err);
    return res.json({ status: false, message: err.message });
  }
});

// Password encryption endpoint
app.post('/encryptPassword', (req, res) => {
  const { password } = req.body;
  if (!password) return res.json({ status: false, message: 'Missing password' });
  return res.json({ encryptedPassword: xorEncrypt(password) });
});

// Stub endpoints
app.post('/checkSuppression', (req, res) => res.json({ status: true }));
app.post('/logLogin', (req, res) => res.json({ status: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Grade Durian backend running on port ${PORT}`);
  warmUpCookies('https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx');
});
