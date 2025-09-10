// netlify/functions/send-email.js
// Serverless function to send contact form emails via Resend for DC Performance Coaching
// This function mirrors the implementation used on the Silverstone reference site
// but updates the default email addresses to reflect the DC Performance Coaching
// brand.  When deployed to Netlify the environment variables RESEND_API_KEY,
// CONTACT_TO and CONTACT_FROM should be set via the dashboard.  If the
// variables are not provided the function falls back to sensible defaults.

const https = require('https');

exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the incoming JSON payload
    const body = JSON.parse(event.body || '{}');
    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const message = (body.message || '').toString().trim();

    // Validate required fields
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing fields' }),
      };
    }

    // Read environment variables.  The API key must be provided at build time.
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const TO_EMAIL = process.env.CONTACT_TO || 'info@dcperformancecoaching.com';
    const FROM_EMAIL = process.env.CONTACT_FROM || 'noreply@dcperformancecoaching.com';

    if (!RESEND_API_KEY) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing RESEND_API_KEY' }),
      };
    }

    // Construct the email payload expected by the Resend API
    const payload = JSON.stringify({
      from: `DC Performance Coaching <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      subject: 'New contact form message',
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      reply_to: email,
      replyTo: email,
      headers: { 'Reply-To': email },
    });

    // Define HTTP request options
    const requestOptions = {
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    // Send the request and wait for the response
    const resBody = await new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data || '{}');
          } else {
            reject(new Error(`Resend API error (${res.statusCode}): ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, data: JSON.parse(resBody || '{}') }),
    };
  } catch (err) {
    // Handle unexpected errors gracefully
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server error', detail: String(err && err.message || err) }),
    };
  }
};