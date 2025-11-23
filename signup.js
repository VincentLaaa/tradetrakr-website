
// Use shared Supabase client
const supabase = window.supabaseClient;

const googleBtn = document.getElementById('google-btn');
const signupForm = document.getElementById('signup-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const errorMsg = document.getElementById('error-msg');
const successMsg = document.getElementById('success-msg');

// Helper to show errors
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    successMsg.style.display = 'none';
}

// Helper to show success
function showSuccess(message) {
    successMsg.textContent = message;
    successMsg.style.display = 'block';
    errorMsg.style.display = 'none';
}

// Google Sign-In Handler
googleBtn.addEventListener('click', async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                redirectTo: window.location.origin + '/onboarding.html'
            },
        });
        if (error) throw error;
        // Supabase handles the redirect automatically
    } catch (error) {
        showError(error.message);
    }
});

// Email/Password Sign-Up Handler
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    // Basic validation
    if (password.length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) throw error;

        if (data.user && !data.session) {
            // Email confirmation required
            showSuccess('Account created! Please check your email to confirm your registration.');
            signupForm.reset();
        } else if (data.user && data.session) {
            // Auto-confirmed (if disabled in settings)
            showSuccess('Account created successfully! Checking subscription...');

            // Check subscription tier
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', data.user.id)
                .single();

            if (profile && profile.subscription_tier === 'paid') {
                window.location.href = 'download.html';
            } else {
                window.location.href = 'onboarding.html';
            }
        }
    } catch (error) {
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign up';
    }
});
