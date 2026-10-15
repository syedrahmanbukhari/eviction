(() => {
  "use strict";

  const disclaimer = document.getElementById("disclaimer-scroll");
  const checkbox = document.getElementById("acknowledge-checkbox");
  const registerButton = document.getElementById("register-button");
  const readStatus = document.getElementById("read-status");
  const registerStatus = document.getElementById("register-status");
  const year = document.getElementById("year");
  const topDisclaimer = document.getElementById("top-disclaimer-full");

  year.textContent = String(new Date().getFullYear());
  topDisclaimer.appendChild(document.querySelector(".disclaimer-body").cloneNode(true));

  // Only HTTPS links are accepted. The URL lives in config.js so it can be added
  // after the client supplies it without rebuilding the website.
  function getRegistrationUrl() {
    const raw = window.MASTERCLASS_CONFIG?.registrationUrl;
    if (typeof raw !== "string" || !raw.trim()) return null;
    try {
      const url = new URL(raw.trim());
      return url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function hasReachedEnd() {
    return disclaimer.scrollTop + disclaimer.clientHeight >= disclaimer.scrollHeight - 12;
  }

  function updateRegistration() {
    const url = getRegistrationUrl();
    registerButton.disabled = !(checkbox.checked && url);
    if (!checkbox.checked) {
      registerStatus.textContent = "Read and acknowledge the disclaimer to continue.";
    } else if (!url) {
      registerStatus.textContent = "Registration link coming soon. Please check back later.";
    } else {
      registerStatus.textContent = "You’ll continue to the paid Zoom registration page.";
    }
  }

  function updateReadState() {
    if (!checkbox.disabled || !hasReachedEnd()) return;
    checkbox.disabled = false;
    readStatus.textContent = "You’ve reached the end. You may now acknowledge the disclaimer.";
  }

  disclaimer.addEventListener("scroll", updateReadState, { passive: true });
  checkbox.addEventListener("change", updateRegistration);
  registerButton.addEventListener("click", () => {
    const url = getRegistrationUrl();
    if (checkbox.checked && url) window.location.assign(url);
  });

  updateReadState();
  updateRegistration();
})();
