// --- Dashboard Access Guard ---
(async function checkAccess() {
  // Skip this guard on index.html (public landing page)
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'index.html' || currentPage === '') {
    return;
  }

  // Use shared Supabase client
  if (typeof window.supabaseClient === 'undefined') {
    console.error('Supabase client not loaded. Make sure supabaseClient.js is included before script.js');
    return;
  }

  const supabase = window.supabaseClient;

  // Check User Session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = 'signin.html'; // Redirect to login if not authenticated
    return;
  }

  // Check Subscription Status
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (error || !profile || profile.subscription_tier !== 'paid') {
    window.location.href = 'onboarding-paywall.html'; // Redirect to paywall if not paid
  }
  // If paid, allow dashboard to load
})();

const LICENSE_FLAG_KEY = "license_valid";
const LICENSE_VALUE_KEY = "license_key";
const WORKER_ENDPOINT = "https://tradetrak-license-worker.shockinvest.workers.dev/license/validate";
const RELEASE_API_URL = "https://api.github.com/repos/VincentLaaa/tradetrakr-releases/releases/latest";
const RELEASE_PAGE_URL = "https://github.com/VincentLaaa/tradetrakr-releases/releases";

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

function formatDate(dateString) {
  if (!dateString) return "Unknown release date";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

async function hydrateReleaseInfo() {
  const releaseLink = document.getElementById("release-link");
  const versionEl = document.getElementById("release-version");
  const updateList = document.getElementById("update-list");

  if (!releaseLink || !updateList) {
    return;
  }

  try {
    const response = await fetch(RELEASE_API_URL, {
      headers: {
        Accept: "application/vnd.github+json"
      }
    });

    if (!response.ok) {
      throw new Error(`Release request failed: ${response.status}`);
    }

    const release = await response.json();
    const fallbackUrl = release.html_url || releaseLink.href || RELEASE_PAGE_URL;
    releaseLink.href = fallbackUrl;
    releaseLink.classList.remove("disabled");

    if (versionEl) {
      const releaseName = release.name || release.tag_name || "Latest Release";
      versionEl.textContent = `${releaseName} • Published ${formatDate(release.published_at)}`;
    }

    updateList.innerHTML = "";
    const entry = document.createElement("li");

    const title = document.createElement("span");
    title.className = "update-title";
    title.textContent = release.name || release.tag_name || "Latest Update";

    const dateLine = document.createElement("span");
    dateLine.className = "update-date";
    dateLine.textContent = `Published ${formatDate(release.published_at)}`;

    entry.append(title, dateLine);

    if (release.body) {
      const lines = release.body
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !/^#+\s*/.test(line));

      lines.slice(0, 3).forEach((line) => {
        const detail = document.createElement("span");
        detail.className = "update-detail";
        detail.textContent = line.replace(/^[-*•]\s*/, "");
        entry.append(detail);
      });
    }

    const linkDetail = document.createElement("span");
    linkDetail.className = "update-detail";
    const link = document.createElement("a");
    link.href = fallbackUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View full release on GitHub →";
    linkDetail.append(link);
    entry.append(linkDetail);

    updateList.append(entry);
  } catch (error) {
    releaseLink.href = RELEASE_PAGE_URL;
    releaseLink.classList.remove("disabled");

    if (versionEl) {
      versionEl.textContent = "Unable to fetch release info. Browse releases on GitHub.";
    }

    updateList.innerHTML = "";
    const fallbackEntry = document.createElement("li");
    const title = document.createElement("span");
    title.className = "update-title";
    title.textContent = "Latest release data unavailable";
    const dateLine = document.createElement("span");
    dateLine.className = "update-date";
    dateLine.textContent = "Check GitHub releases manually.";
    const linkDetail = document.createElement("span");
    linkDetail.className = "update-detail";
    const link = document.createElement("a");
    link.href = RELEASE_PAGE_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open TradeTrakR releases →";
    linkDetail.append(link);
    fallbackEntry.append(title, dateLine, linkDetail);
    updateList.append(fallbackEntry);
  }
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

  hydrateReleaseInfo();
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

// Scroll-based 3D Animation for Dashboard
function initDashboardScrollAnimation() {
  const dashboard = document.querySelector('.hero-dashboard-display');
  if (!dashboard) return;

  // Initial state
  let currentScroll = window.scrollY;

  function updateDashboardTransform() {
    const scrollY = window.scrollY;
    // Calculate progress: 0 at top, 1 after scrolling 500px (adjust as needed)
    const progress = Math.min(Math.max(scrollY / 600, 0), 1);

    // Ease the progress for smoother feel
    const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out

    // Interpolate values
    // RotateX: Starts at 45deg (flat), ends at 0deg (straight)
    const rotateX = 45 - (45 * easedProgress);

    // Scale: Starts at 0.9, ends at 1.0
    const scale = 0.9 + (0.1 * easedProgress);

    // TranslateY: Starts at 60px, ends at 0px
    const translateY = 60 - (60 * easedProgress);

    // Apply transform
    dashboard.style.transform = `perspective(1200px) rotateX(${rotateX}deg) scale(${scale}) translateY(${translateY}px)`;

    requestAnimationFrame(updateDashboardTransform);
  }

  // Start the animation loop
  requestAnimationFrame(updateDashboardTransform);
}

document.addEventListener("DOMContentLoaded", () => {
  initDashboardScrollAnimation();
});
