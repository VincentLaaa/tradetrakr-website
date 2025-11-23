// Initialize Supabase Client
const supabaseUrl = 'https://afqsiqoksuuddplockbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcXNpcW9rc3V1ZGRwbG9ja2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MjM2NjksImV4cCI6MjA3ODk5OTY2OX0.drzxOAIUZP3ZhrdqGCJOAzBM8oaeOqVfVp7ATbacNoo';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// --- Grid Animation (3D Tilt Neon Grid) ---
const canvas = document.getElementById('grid-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
let time = 0;

// Configuration
const GRID_SIZE = 60;
const PERSPECTIVE = 600;
const TILT_AMOUNT = 3; // Degrees (subtle)
const PARALLAX_STRENGTH = 15;

function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resize);
resize();

// Initialize mouse in center
targetMouseX = width / 2;
targetMouseY = height / 2;
mouseX = targetMouseX;
mouseY = targetMouseY;

window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
});

function draw() {
    // Smooth mouse
    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;
    time += 0.01;

    // 1. 3D Tilt via CSS
    // Normalize mouse -1 to 1
    const normX = (mouseX / width) * 2 - 1;
    const normY = (mouseY / height) * 2 - 1;

    // RotateX (tilt up/down) depends on Y position
    // RotateY (tilt left/right) depends on X position
    // Invert Y for natural feel
    const rotX = -normY * TILT_AMOUNT;
    const rotY = normX * TILT_AMOUNT;

    canvas.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.05)`;

    // 2. Draw Grid
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    // Parallax offset
    const offX = -normX * PARALLAX_STRENGTH;
    const offY = -normY * PARALLAX_STRENGTH;

    ctx.lineWidth = 1;

    // Vertical lines
    // Add extra lines to cover edges during tilt/parallax
    const startX = (offX % GRID_SIZE) - GRID_SIZE;
    const startY = (offY % GRID_SIZE) - GRID_SIZE;

    for (let x = startX; x < width + GRID_SIZE; x += GRID_SIZE) {
        const alpha = 0.08 + Math.sin((x * 0.01) + (time * 0.5)) * 0.04; // Subtle wave
        ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`; // Cyan
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = startY; y < height + GRID_SIZE; y += GRID_SIZE) {
        const alpha = 0.08 + Math.cos((y * 0.01) + (time * 0.5)) * 0.04;
        ctx.strokeStyle = `rgba(189, 0, 255, ${alpha})`; // Violet/Purple
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // 3. Glowing Intersections
    for (let x = startX; x < width + GRID_SIZE; x += GRID_SIZE) {
        for (let y = startY; y < height + GRID_SIZE; y += GRID_SIZE) {
            // Pseudo-random check for "active" nodes
            if (Math.sin(x * 0.02 + y * 0.03 + time) > 0.99) {
                const size = 1.0 + Math.sin(time * 5 + x) * 0.5;

                // Glow
                const g = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
                g.addColorStop(0, 'rgba(0, 243, 255, 0.3)');
                g.addColorStop(1, 'transparent');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, y, size * 3, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // 4. Mouse Glow
    const glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 400);
    glow.addColorStop(0, 'rgba(0, 243, 255, 0.06)');
    glow.addColorStop(0.5, 'rgba(189, 0, 255, 0.02)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    requestAnimationFrame(draw);
}
draw();


// --- License Worker Endpoint ---
const LICENSE_WORKER_ENDPOINT =
  "https://tradetrak-license-worker.shockinvest.workers.dev/license/validate";

// --- HWID helper (same idea as the app, but safe on web) ---
let hwidPromise = null;

async function getHardwareId() {
  if (!hwidPromise) {
    if (window.crypto && window.crypto.subtle) {
      // SHA-256(navigator.userAgent) -> hex string
      hwidPromise = window.crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(navigator.userAgent))
        .then((buffer) =>
          Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
        )
        .catch((err) => {
          console.error("HWID generation failed, using fallback:", err);
          // Fallback so hwid is NEVER undefined
          return (
            "web-" +
            Math.random().toString(16).slice(2) +
            Date.now().toString(16)
          );
        });
    } else {
      // Older browsers without crypto.subtle
      hwidPromise = Promise.resolve(
        "web-" +
          Math.random().toString(16).slice(2) +
          Date.now().toString(16)
      );
    }
  }
  return hwidPromise;
}

// --- Program-style license validation via Cloudflare Worker ---
async function validateLicenseWithWorker(licenseKey) {
  const hwidHex = await getHardwareId();

  const payload = { license: licenseKey, hwid: hwidHex };
  console.log("Sending payload to license worker:", payload);

  const response = await fetch(LICENSE_WORKER_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  let data = {};
  try {
    data = await response.json();
  } catch (err) {
    console.error("Failed to parse license worker response:", err);
  }

  return { response, data };
}

// --- Modal & License Logic ---
const modal = document.getElementById('key-modal');
const openBtn = document.getElementById('open-key-modal');
const closeBtn = document.getElementById('close-modal');
const validateBtn = document.getElementById('validate-btn');
const licenseInput = document.getElementById('license-key');
const statusMsg = document.getElementById('validation-status');

function showStatus(msg, type) {
  if (!statusMsg) return;
  statusMsg.textContent = msg;
  statusMsg.className = "status-msg " + (type || "");
}

openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('active');
    licenseInput.focus();
});

closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    showStatus('', '');
});

// Close on click outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

if (validateBtn && licenseInput) {
  validateBtn.addEventListener("click", async () => {
    const key = licenseInput.value.trim();

    if (!key) {
      showStatus("Please paste your license key.", "error");
      return;
    }

    // Minimal sanity check only (no S- requirement, keys can start with any letter)
    if (key.length < 8) {
      showStatus("That doesn't look like a valid license key.", "error");
      return;
    }

    validateBtn.disabled = true;
    validateBtn.textContent = "Validating…";
    showStatus("", "");

    try {
      const { response, data } = await validateLicenseWithWorker(key);

      // HTTP/network errors
      if (!response.ok) {
        console.error("License worker HTTP error:", response.status, data);
        showStatus("Unable to validate license. Please try again.", "error");
        return;
      }

      // Logical error from worker
      if (!data || data.ok !== true) {
        switch (data && data.error) {
          case "invalid_or_expired":
            showStatus("❌ Invalid or expired license key.", "error");
            break;
          case "metadata_mismatch":
            showStatus(
              "⚠️ This license is already bound to another device. Please reset it in Whop or contact support.",
              "error"
            );
            break;
          case "unauthorized_whop_api_key":
            showStatus("Server authentication error. Please contact support.", "error");
            break;
          case "missing_license_or_hwid":
            showStatus("Missing license or device ID. Please refresh and try again.", "error");
            break;
          default:
            showStatus("❌ Could not verify license. Please try again.", "error");
        }
        return;
      }

      // SUCCESS: ok === true
      // For WEBSITE ONLY: ignore securityViolation as a blocker
      if (data.securityViolation) {
        console.warn(
          "License securityViolation from worker (ignored on web):",
          data.securityViolation
        );
      }

      showStatus("License verified! Updating your access…", "success");

      // Optional: if user is logged into Supabase, mark them as paid
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData && userData.user;

        if (user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ subscription_tier: "paid" })
            .eq("id", user.id);

          if (profileError) {
            console.error("Failed to update profile subscription_tier:", profileError);
          }
        }
      } catch (profileErr) {
        console.error("Supabase profile update error:", profileErr);
      }

      // Redirect to download/dashboard page after a short delay
      setTimeout(() => {
        window.location.href = "download.html";
      }, 800);

    } catch (err) {
      console.error("License validation exception:", err);
      showStatus("Connection failed. Please try again.", "error");
    } finally {
      validateBtn.disabled = false;
      validateBtn.textContent = "Validate License";
    }
  });
} else {
  console.warn("onboarding.js: license input or validate button not found.");
}
