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


// --- License Verification Logic ---
const WORKER_ENDPOINT = "https://tradetrak-license-worker.shockinvest.workers.dev/license/validate";

async function postLicenseForValidation(licenseKey) {
    const response = await fetch(WORKER_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({ license: licenseKey })
    });

    const data = await response.json().catch(() => ({}));
    return data;
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
    if (!key) return;

    validateBtn.disabled = true;
    validateBtn.textContent = 'Validating...';
    showStatus('', '');

    try {
        // 1. Validate with Worker (No HWID)
        const data = await postLicenseForValidation(key);

        if (data?.ok) {
            showStatus('License verified! Updating profile...', 'success');

            // 2. Update Supabase Profile with Membership Info
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: 'paid',
                        whop_membership_id: data.membership_id,
                        whop_plan_id: data.plan_id,
                        whop_status: data.status,
                        whop_last_sync_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                if (error) throw error;

                showStatus('Success! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'download.html';
                }, 1000);
            } else {
                showStatus('Error: User not logged in.', 'error');
            }

        } else {
            // Handle errors
            if (data?.error === "invalid_or_expired") {
                showStatus("❌ Invalid or expired license.", "error");
            } else {
                showStatus(`Error: ${data?.error || "Unknown error"}`, "error");
            }
        }

    } catch (error) {
        console.error(error);
        showStatus('Connection failed. Try again.', 'error');
    } finally {
        validateBtn.disabled = false;
        validateBtn.textContent = 'Validate License';
    }
});

function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg ${type}`;
}
