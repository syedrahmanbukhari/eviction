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
  const originalKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.RESEND_FROM_EMAIL;
  const originalFetch = global.fetch;
  try {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    const methodRejected = response();
    await handler({ method: 'GET' }, methodRejected);
    assert.equal(methodRejected.statusCode, 405);

    const invalidEmail = response();
    await handler({ method: 'POST', body: { email: 'invalid' } }, invalidEmail);
    assert.equal(invalidEmail.statusCode, 400);

    const unconfigured = response();
    await handler({ method: 'POST', body: { email: 'buyer@example.com' } }, unconfigured);
    assert.equal(unconfigured.statusCode, 503);

    process.env.RESEND_API_KEY = 'test-key';
    process.env.RESEND_FROM_EMAIL = 'onboarding@resend.dev';
    let request;
    global.fetch = async (url, options) => {
      request = { url, options };
      return { ok: true };
    };

    const success = response();
    await handler({ method: 'POST', body: { email: ' buyer@example.com ' } }, success);
    assert.equal(success.statusCode, 200);
    assert.equal(success.data.sent, true);
    assert.equal(request.url, 'https://api.resend.com/emails');
    assert.equal(request.options.headers.Authorization, 'Bearer test-key');
    const message = JSON.parse(request.options.body);
    assert.deepEqual(message.to, ['buyer@example.com']);
    assert.equal(message.from, 'onboarding@resend.dev');
    assert.match(message.text, /Here is your Zoom link/);
    assert.doesNotMatch(message.text, /https?:\/\//);

    global.fetch = async () => ({ ok: false });
    const failed = response();
    await handler({ method: 'POST', body: { email: 'buyer@example.com' } }, failed);
    assert.equal(failed.statusCode, 502);
    assert.doesNotMatch(JSON.stringify(failed.data), /test-key/);
  } finally {
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    if (originalFrom === undefined) delete process.env.RESEND_FROM_EMAIL;
    else process.env.RESEND_FROM_EMAIL = originalFrom;
    global.fetch = originalFetch;
  }

  console.log('Test-email API validation tests passed.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
