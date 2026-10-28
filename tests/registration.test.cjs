const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function loadPage({ paypalAvailable = true, renderFails = false, emailRequestFails = false } = {}) {
  const elements = {};
  for (const id of [
    'disclaimer-scroll', 'acknowledge-checkbox', 'registration-email', 'register-button',
    'paypal-container-RY59UWXKRTN34', 'read-status', 'email-status', 'register-status', 'year'
  ]) {
    elements[id] = {
      disabled: ['acknowledge-checkbox', 'register-button'].includes(id),
      hidden: id === 'paypal-container-RY59UWXKRTN34',
      checked: false,
      value: id === 'registration-email' ? 'buyer@example.com' : '',
      textContent: '',
      valid: true,
      reportValidity() { return this.valid; },
      scrollTop: 0,
      clientHeight: 400,
      scrollHeight: 1200,
      listeners: {},
      addEventListener(event, handler) { this.listeners[event] = handler; }
    };
  }

  const renders = [];
  const requests = [];
  const paypal = paypalAvailable ? {
    HostedButtons(options) {
      assert.equal(options.hostedButtonId, 'RY59UWXKRTN34');
      return {
        render(selector) {
          renders.push(selector);
          return renderFails ? Promise.reject(new Error('PayPal unavailable')) : Promise.resolve();
        }
      };
    }
  } : undefined;

  vm.runInNewContext(code, {
    document: { getElementById(id) { return elements[id]; } },
    window: { paypal },
    fetch(url, options) {
      requests.push({ url, options });
      return Promise.resolve({ ok: !emailRequestFails });
    },
    Date
  });

  return { elements, renders, requests };
}

async function settle() {
  await new Promise(resolve => setImmediate(resolve));
}

function acknowledge(page) {
  page.elements['disclaimer-scroll'].scrollTop = 800;
  page.elements['disclaimer-scroll'].listeners.scroll();
  page.elements['acknowledge-checkbox'].checked = true;
  page.elements['acknowledge-checkbox'].listeners.change();
}

async function main() {
  assert.match(html, /components=hosted-buttons/);
  assert.match(html, /type="email"/);
  assert.match(html, /id="paypal-container-RY59UWXKRTN34"/);

  const page = loadPage();
  assert.equal(page.elements['acknowledge-checkbox'].disabled, true);
  assert.equal(page.elements['register-button'].disabled, true);
  assert.equal(page.elements['paypal-container-RY59UWXKRTN34'].hidden, true);
  await page.elements['register-button'].listeners.click();
  assert.equal(page.requests.length, 0, 'a disabled acknowledgment cannot send an email');

  acknowledge(page);
  assert.equal(page.elements['register-button'].disabled, false);
  assert.equal(page.elements['paypal-container-RY59UWXKRTN34'].hidden, true);
  assert.equal(page.renders.length, 0);

  page.elements['registration-email'].valid = false;
  await page.elements['register-button'].listeners.click();
  assert.equal(page.requests.length, 0, 'an invalid email cannot be submitted');

  page.elements['registration-email'].valid = true;
  await page.elements['register-button'].listeners.click();
  await settle();
  assert.equal(page.requests.length, 1);
  assert.equal(page.requests[0].url, '/api/send-test-email');
  assert.equal(JSON.parse(page.requests[0].options.body).email, 'buyer@example.com');
  assert.match(page.elements['email-status'].textContent, /Test email sent/);
  assert.equal(page.elements['registration-email'].disabled, true);
  assert.equal(page.elements['register-button'].hidden, true);
  assert.equal(page.elements['paypal-container-RY59UWXKRTN34'].hidden, false);
  assert.deepEqual(page.renders, ['#paypal-container-RY59UWXKRTN34']);

  page.elements['acknowledge-checkbox'].checked = false;
  page.elements['acknowledge-checkbox'].listeners.change();
  assert.equal(page.elements['paypal-container-RY59UWXKRTN34'].hidden, true);
  page.elements['acknowledge-checkbox'].checked = true;
  page.elements['acknowledge-checkbox'].listeners.change();
  assert.equal(page.elements['paypal-container-RY59UWXKRTN34'].hidden, false);
  assert.equal(page.renders.length, 1, 'PayPal renders only once');

  const failedEmail = loadPage({ emailRequestFails: true });
  acknowledge(failedEmail);
  await failedEmail.elements['register-button'].listeners.click();
  await settle();
  assert.match(failedEmail.elements['email-status'].textContent, /could not be sent/);
  assert.equal(failedEmail.elements['register-button'].hidden, false, 'email can be retried');
  assert.equal(failedEmail.elements['paypal-container-RY59UWXKRTN34'].hidden, false, 'checkout stays available');

  for (const options of [{ paypalAvailable: false }, { renderFails: true }]) {
    const failedPayPal = loadPage(options);
    acknowledge(failedPayPal);
    await failedPayPal.elements['register-button'].listeners.click();
    await settle();
    assert.equal(failedPayPal.elements['paypal-container-RY59UWXKRTN34'].hidden, true);
    assert.match(failedPayPal.elements['register-status'].textContent, /could not load/);
  }

  console.log('Registration email and PayPal gating tests passed.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
