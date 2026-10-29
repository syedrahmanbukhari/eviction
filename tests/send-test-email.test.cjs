const assert = require('node:assert/strict');

function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; }
  };
}

async function main() {
  const { default: handler } = await import('../api/send-test-email.mjs');
  const originalKey = process.env.BREVO_API_KEY;
  const originalFrom = process.env.BREVO_FROM_EMAIL;
  const originalFetch = global.fetch;
  try {
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_FROM_EMAIL;
    const methodRejected = response();
    await handler({ method: 'GET' }, methodRejected);
    assert.equal(methodRejected.statusCode, 405);

    const invalidEmail = response();
    await handler({ method: 'POST', body: { email: 'invalid' } }, invalidEmail);
    assert.equal(invalidEmail.statusCode, 400);

    const unconfigured = response();
    await handler({ method: 'POST', body: { email: 'buyer@example.com' } }, unconfigured);
    assert.equal(unconfigured.statusCode, 503);

    process.env.BREVO_API_KEY = 'test-key';
    process.env.BREVO_FROM_EMAIL = 'sender@example.com';
    let request;
    global.fetch = async (url, options) => {
      request = { url, options };
      return { ok: true };
    };

    const success = response();
    await handler({ method: 'POST', body: { email: ' buyer@example.com ' } }, success);
    assert.equal(success.statusCode, 200);
    assert.equal(success.data.sent, true);
    assert.equal(request.url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(request.options.headers['api-key'], 'test-key');
    const message = JSON.parse(request.options.body);
    assert.deepEqual(message.to, [{ email: 'buyer@example.com' }]);
    assert.deepEqual(message.sender, { name: 'Tenant Resource Assistant', email: 'sender@example.com' });
    const zoomUrl = 'https://us06web.zoom.us/meeting/register/-ahKmxQOQC-QpBO4rZNVYg';
    assert.match(message.subject, /Zoom registration link/);
    assert.ok(message.htmlContent.includes(`href="${zoomUrl}"`));
    assert.match(message.htmlContent, /Open the Zoom registration link/);
    assert.equal('textContent' in message, false, 'Brevo accepts one body format per request');
    assert.match(message.htmlContent, /tenant-resource-logo\.png/);
    assert.match(message.htmlContent, /#d7978b/);
    assert.match(message.htmlContent, /#263b38/);
    assert.doesNotMatch(message.htmlContent, /payment (was|is) (complete|confirmed)/i);

    global.fetch = async () => ({ ok: false });
    const failed = response();
    await handler({ method: 'POST', body: { email: 'buyer@example.com' } }, failed);
    assert.equal(failed.statusCode, 502);
    assert.doesNotMatch(JSON.stringify(failed.data), /test-key/);
  } finally {
    if (originalKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = originalKey;
    if (originalFrom === undefined) delete process.env.BREVO_FROM_EMAIL;
    else process.env.BREVO_FROM_EMAIL = originalFrom;
    global.fetch = originalFetch;
  }

  console.log('Test-email API validation tests passed.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
