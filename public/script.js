const LICENSE_FLAG_KEY = "license_valid";
const LICENSE_VALUE_KEY = "license_key";
const WORKER_ENDPOINT = "https://tradetrak-license-worker.shockinvest.workers.dev/license/validate";

let hwidPromise = null;

function setStatus(text, type = "") {
  const statusEl = document.getElementById("status");
  if (!statusEl) return;

  statusEl.textContent = text;
  statusEl.className = type ? `${type}` : "";
}

async function getHardwareId() {
  if (!hwidPromise) {
    hwidPromise = crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(navigator.userAgent))
      .then((buffer) =>
        Array.from(new Uint8Array(buffer))
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("")
      )
      .catch((error) => {
        hwidPromise = null;
        throw error;
      });
  }
  return hwidPromise;
}

async function postLicenseForValidation(licenseKey) {
  const hwidHex = await getHardwareId();
  const response = await fetch(WORKER_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({ license: licenseKey, hwid: hwidHex })
  });

  const data = await response.json().catch(() => ({}));
  return data;
}

function clearSavedLicense() {
  localStorage.removeItem(LICENSE_FLAG_KEY);
  localStorage.removeItem(LICENSE_VALUE_KEY);
}

async function verifyStoredLicense() {
  const storedLicense = localStorage.getItem(LICENSE_VALUE_KEY);
  if (!storedLicense) {
    clearSavedLicense();
    return false;
  }

  try {
    const data = await postLicenseForValidation(storedLicense);
    if (data?.ok) {
      localStorage.setItem(LICENSE_FLAG_KEY, "true");
      return true;
    }
  } catch (error) {
    return localStorage.getItem(LICENSE_FLAG_KEY) === "true";
  }

  clearSavedLicense();
  return false;
}

async function validateLicense() {
  const input = document.getElementById("license-input");
  const validateBtn = document.getElementById("validate-btn");

  if (!input || !validateBtn) return;

  const license = input.value.trim();
  if (!license) {
    setStatus("Please enter your license key.", "error");
    return;
  }

  validateBtn.disabled = true;
  setStatus("Validating license…", "info");

  try {
    const data = await postLicenseForValidation(license);

    if (data?.ok) {
      localStorage.setItem(LICENSE_FLAG_KEY, "true");
      localStorage.setItem(LICENSE_VALUE_KEY, license);
      setStatus("✅ License verified successfully.", "success");
      setTimeout(() => {
        window.location.href = "download.html";
      }, 800);
      return;
    }

    switch (data?.error) {
      case "metadata_mismatch":
        setStatus("⚠️ This license is already bound to another device.", "error");
        break;
      case "invalid_or_expired":
        setStatus("❌ Invalid or expired license.", "error");
        break;
      case "unauthorized_whop_api_key":
        setStatus("Server authentication error. Please contact support.", "error");
        break;
      default:
        setStatus("❌ Invalid or expired license.", "error");
    }
  } catch (error) {
    setStatus("Connection failed. Try again.", "error");
  } finally {
    validateBtn.disabled = false;
  }
}

function initLicensePage(isLicensed = false) {
  const validateBtn = document.getElementById("validate-btn");
  if (!validateBtn) return;

  validateBtn.addEventListener("click", validateLicense);

  if (isLicensed) {
    setStatus("✅ You're already signed in. Redirecting…", "success");
    setTimeout(() => {
      window.location.href = "download.html";
    }, 600);
    return;
  }
}

function initDownloadPage(isLicensed = false) {
  const signOutBtn = document.getElementById("sign-out");
  if (!signOutBtn) return;

  if (!isLicensed) {
    clearSavedLicense();
    window.location.href = "signin.html";
    return;
  }

  signOutBtn.addEventListener("click", () => {
    clearSavedLicense();
    window.location.href = "signin.html";
  });
}

function updateIndexUi(isLicensed = false) {
  const navSignIn = document.getElementById("nav-signin");
  if (!navSignIn) return;

  if (isLicensed) {
    if (navSignIn) {
      navSignIn.textContent = "Go to Dashboard";
      navSignIn.href = "download.html";
    }
  } else {
    if (navSignIn) {
      navSignIn.textContent = "Sign In";
      navSignIn.href = "signin.html";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  verifyStoredLicense()
    .then((isLicensed) => {
      updateIndexUi(isLicensed);
      initLicensePage(isLicensed);
      initDownloadPage(isLicensed);
    })
    .catch(() => {
      updateIndexUi(false);
      initLicensePage(false);
      initDownloadPage(false);
    });
});
