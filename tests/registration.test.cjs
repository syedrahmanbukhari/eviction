const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function loadPage({ paypalAvailable = true, renderFails = false } = {}) {
  const elements = {};
  for (const id of [
    'disclaimer-scroll', 'acknowledge-checkbox', 'register-button',
    'paypal-container-RY59UWXKRTN34', 'read-status', 'register-status', 'year'
  ]) {
    elements[id] = {
      disabled: ['acknowledge-checkbox', 'register-button'].includes(id),
      hidden: id === 'paypal-container-RY59UWXKRTN34',
      checked: false,
      scrollTop: 0,
      clientHeight: 400,
      scrollHeight: 1200,
      listeners: {},
      addEventListener(event, handler) { this.listeners[event] = handler; }
    };
  }

  const renders = [];
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
    Date
  });

  return { elements, renders };
}

async function settle() {
  await new Promise(resolve => setImmediate(resolve));
}

async function main() {
  assert.match(html, /components=hosted-buttons/);
  assert.match(html, /id="paypal-container-RY59UWXKRTN34"/);
  assert.doesNotMatch(html, /Register Now — \$47/);

  const { elements, renders } = loadPage();
  assert.equal(elements['acknowledge-checkbox'].disabled, true);
  assert.equal(elements['register-button'].hidden, false);
  assert.equal(elements['paypal-container-RY59UWXKRTN34'].hidden, true);
  assert.equal(renders.length, 0);

  elements['acknowledge-checkbox'].checked = true;
  elements['acknowledge-checkbox'].listeners.change();
  assert.equal(renders.length, 0, 'checking a disabled acknowledgment must not reveal payment');

  elements['disclaimer-scroll'].scrollTop = 800;
  elements['disclaimer-scroll'].listeners.scroll();
  assert.equal(elements['acknowledge-checkbox'].disabled, false);
  elements['acknowledge-checkbox'].listeners.change();
  assert.equal(elements['register-button'].hidden, true);
  assert.equal(elements['paypal-container-RY59UWXKRTN34'].hidden, false);
  assert.deepEqual(renders, ['#paypal-container-RY59UWXKRTN34']);
  await settle();

  elements['acknowledge-checkbox'].checked = false;
  elements['acknowledge-checkbox'].listeners.change();
  assert.equal(elements['paypal-container-RY59UWXKRTN34'].hidden, true);
  elements['acknowledge-checkbox'].checked = true;
  elements['acknowledge-checkbox'].listeners.change();
  assert.equal(elements['paypal-container-RY59UWXKRTN34'].hidden, false);
  assert.equal(renders.length, 1, 'PayPal button should render only once');

  for (const options of [{ paypalAvailable: false }, { renderFails: true }]) {
    const failed = loadPage(options);
    failed.elements['disclaimer-scroll'].scrollTop = 800;
    failed.elements['disclaimer-scroll'].listeners.scroll();
    failed.elements['acknowledge-checkbox'].checked = true;
    failed.elements['acknowledge-checkbox'].listeners.change();
    await settle();
    assert.equal(failed.elements['paypal-container-RY59UWXKRTN34'].hidden, true);
    assert.match(failed.elements['register-status'].textContent, /could not load/);
  }

  console.log('PayPal acknowledgment gating tests passed.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
