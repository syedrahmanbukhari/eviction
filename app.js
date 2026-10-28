(() => {
  "use strict";

  const disclaimer = document.getElementById("disclaimer-scroll");
  const checkbox = document.getElementById("acknowledge-checkbox");
  const emailInput = document.getElementById("registration-email");
  const registerButton = document.getElementById("register-button");
  const paypalContainer = document.getElementById("paypal-container-RY59UWXKRTN34");
  const readStatus = document.getElementById("read-status");
  const emailStatus = document.getElementById("email-status");
  const registerStatus = document.getElementById("register-status");
  const year = document.getElementById("year");
  let emailSent = false;
  let sendingEmail = false;
  let checkoutRequested = false;
  let checkoutError = false;
  let paypalRendered = false;
  let paypalRendering = false;

  year.textContent = String(new Date().getFullYear());

  function hasReachedEnd() {
    return disclaimer.scrollTop + disclaimer.clientHeight >= disclaimer.scrollHeight - 12;
  }

  function isAcknowledged() {
    return !checkbox.disabled && checkbox.checked;
  }

  function showCheckoutError() {
    paypalRendering = false;
    checkoutError = true;
    paypalContainer.hidden = true;
    registerStatus.textContent = "PayPal checkout could not load. Please refresh and try again.";
  }

  function renderPayPal() {
    if (paypalRendered || paypalRendering || checkoutError) return;
    if (!window.paypal?.HostedButtons) {
      showCheckoutError();
      return;
    }

    paypalRendering = true;
    try {
      Promise.resolve(window.paypal.HostedButtons({ hostedButtonId: "RY59UWXKRTN34" })
        .render("#paypal-container-RY59UWXKRTN34"))
        .then(() => {
          paypalRendered = true;
          paypalRendering = false;
          if (isAcknowledged()) {
            registerStatus.textContent = "Complete checkout with PayPal. The current price is shown there.";
          }
        })
        .catch(showCheckoutError);
    } catch {
      showCheckoutError();
    }
  }

  function updateRegistration() {
    const acknowledged = isAcknowledged();
    registerButton.disabled = !acknowledged || sendingEmail;
    registerButton.hidden = emailSent;

    if (!acknowledged) {
      paypalContainer.hidden = true;
      registerStatus.textContent = "Read and acknowledge the disclaimer to continue.";
      return;
    }

    if (!checkoutRequested) {
      paypalContainer.hidden = true;
      registerStatus.textContent = "Enter your email and select Register Now to continue.";
      return;
    }

    if (checkoutError) {
      paypalContainer.hidden = true;
      registerStatus.textContent = "PayPal checkout could not load. Please refresh and try again.";
      return;
    }

    paypalContainer.hidden = false;
    registerStatus.textContent = paypalRendered
      ? "Complete checkout with PayPal. The current price is shown there."
      : "Loading secure PayPal checkout...";
    renderPayPal();
  }

  function updateReadState() {
    if (!checkbox.disabled || !hasReachedEnd()) return;
    checkbox.disabled = false;
    readStatus.textContent = "You’ve reached the end. You may now acknowledge the disclaimer.";
  }

  async function sendTestEmail() {
    if (!isAcknowledged() || sendingEmail || emailSent) return;
    if (!emailInput.reportValidity()) return;

    const email = emailInput.value.trim();
    sendingEmail = true;
    registerButton.disabled = true;
    registerButton.textContent = "Sending test email...";
    emailStatus.textContent = "";

    try {
      const response = await fetch("/api/send-test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!response.ok) throw new Error("Email service unavailable");
      emailSent = true;
      emailInput.disabled = true;
      emailStatus.textContent = `Test email sent to ${email}.`;
    } catch {
      emailStatus.textContent = "Test email could not be sent. Check the address and try again.";
    } finally {
      sendingEmail = false;
      checkoutRequested = true;
      registerButton.textContent = emailSent ? "Register Now" : "Retry test email";
      updateRegistration();
    }
  }

  disclaimer.addEventListener("scroll", updateReadState, { passive: true });
  checkbox.addEventListener("change", updateRegistration);
  registerButton.addEventListener("click", sendTestEmail);

  updateReadState();
  updateRegistration();
})();
