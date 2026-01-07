// Use shared Supabase client
const supabase = window.supabaseClient;

// Ensure user profile exists (fallback if trigger doesn't fire)
async function ensureUserProfile() {
    if (!supabase) {
        console.warn('Supabase client not available');
        return false;
    }

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            console.log('No user found, skipping profile creation');
            return false;
        }

        console.log('Checking for profile for user:', user.id);

        // Check if profile exists
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('id, subscription_tier, onboarding_complete')
            .eq('id', user.id)
            .single();

        // If profile doesn't exist, create it
        if (fetchError) {
            // PGRST116 = no rows returned
            if (fetchError.code === 'PGRST116' || fetchError.message?.includes('No rows')) {
                console.log('Profile not found, creating one for user:', user.id);
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        subscription_tier: 'free',
                        onboarding_complete: false
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error creating profile:', insertError);
                    console.error('Insert error details:', JSON.stringify(insertError, null, 2));
                    return false;
                } else {
                    console.log('Profile created successfully:', newProfile);
                    return true;
                }
            } else {
                console.error('Error checking profile:', fetchError);
                console.error('Fetch error details:', JSON.stringify(fetchError, null, 2));
                return false;
            }
        } else {
            console.log('Profile already exists:', profile);
            return true;
        }
    } catch (error) {
        console.error('Error ensuring user profile:', error);
        return false;
    }
}

// Wait for DOM and Supabase to be ready, then ensure profile
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Supabase client to be initialized
    function waitForSupabase(callback, maxAttempts = 15) {
        let attempts = 0;
        const checkSupabase = setInterval(() => {
            attempts++;
            if (window.supabaseClient) {
                clearInterval(checkSupabase);
                console.log('Supabase client found, ensuring profile exists...');
                callback();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkSupabase);
                console.error('Supabase client not found after', maxAttempts, 'attempts');
            }
        }, 100);
    }

    waitForSupabase(() => {
        ensureUserProfile();
    });
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


// --- License Verification Logic ---
const LICENSE_WORKER_ENDPOINT = "https://tradetrak-license-worker.shockinvest.workers.dev/license/validate";

// --- HWID helper (safe and never throws) ---
let hwidPromise = null;

async function getHardwareId() {
  if (!hwidPromise) {
    // Ensure we never throw; everything is wrapped.
    hwidPromise = (async () => {
      try {
        if (
          typeof window !== "undefined" &&
          window.crypto &&
          window.crypto.subtle &&
          typeof TextEncoder !== "undefined"
        ) {
          const enc = new TextEncoder();
          const ua = navigator.userAgent || "tradetrakr-web";
          const buffer = await window.crypto.subtle.digest(
            "SHA-256",
            enc.encode(ua)
          );
          return Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        }
      } catch (err) {
        console.error("HWID generation failed, using fallback:", err);
      }

      // Fallback: guaranteed non-empty string
      return (
        "web-" +
        Math.random().toString(16).slice(2) +
        Date.now().toString(16)
      );
    })();
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
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await response.json();
  } catch (err) {
    console.error("Failed to parse license worker response as JSON:", err);
  }

  console.log("License worker response:", response.status, data);
  return { response, data };
}

// --- Modal & License Logic ---
const modal = document.getElementById('key-modal');
const openBtn = document.getElementById('open-key-modal');
const closeBtn = document.getElementById('close-modal');
const validateBtn = document.getElementById('validate-btn');
const licenseInput = document.getElementById('license-key');
const statusMsg = document.getElementById('validation-status');

openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('active');
    licenseInput.focus();
});

closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    statusMsg.textContent = '';
    statusMsg.className = 'status-msg';
});

// Close on click outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

validateBtn.addEventListener('click', async () => {
    const key = licenseInput.value.trim();
    
    if (!key) {
      showStatus('Please paste your license key.', 'error');
      return;
    }

    // Minimal sanity check (no strict pattern; keys can start with any letter)
    if (key.length < 8) {
      showStatus("That doesn't look like a valid license key.", "error");
      return;
    }

    validateBtn.disabled = true;
    validateBtn.textContent = 'Validating…';
    showStatus('', '');

    try {
      const { response, data } = await validateLicenseWithWorker(key);

      // 1. Handle true network / server issues
      if (!response) {
        console.error("License worker: no response object", data);
        showStatus("Unable to reach license server. Please try again.", "error");
        return;
      }

      if (response.status >= 500) {
        console.error("License worker 5xx error:", response.status, data);
        showStatus("License server error. Please try again.", "error");
        return;
      }

      // 2. For everything else (2xx/3xx/4xx), we rely on data.ok and data.error
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
          case "wrong_product":
            showStatus("❌ This license is for a different product.", "error");
            break;
          case "missing_license":
          case "missing_hwid":
            showStatus("Missing license or device ID. Please refresh and try again.", "error");
            break;
          default:
            showStatus(
              "❌ Could not verify license. Please check your key and try again.",
              "error"
            );
        }
        return;
      }

      // 3. SUCCESS: data.ok === true
      // For WEBSITE ONLY: ignore securityViolation as a blocker
      if (data.securityViolation) {
        console.warn(
          "License securityViolation from worker (ignored on web):",
          data.securityViolation
        );
      }

      showStatus("License verified! Updating your access…", "success");

      // Optional: if there is a logged-in Supabase user, mark them as paid
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

      // Redirect to download/dashboard
      setTimeout(() => {
        window.location.href = "download.html";
      }, 800);

    } catch (err) {
      // Network/CORS/JS exceptions
      console.error("License validation exception:", err);
      const msg =
        err && err.message
          ? `Connection failed: ${err.message}`
          : "Connection failed. Check console for details.";
      showStatus(msg, "error");
    } finally {
      validateBtn.disabled = false;
      validateBtn.textContent = 'Validate License';
    }
});

function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg ${type}`;
}
