
// Use shared Supabase client
const supabase = window.supabaseClient;

const googleBtn = document.getElementById('google-btn');
const signinForm = document.getElementById('signin-form');
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
                redirectTo: window.location.origin + '/download.html'
            },
        });
        if (error) throw error;
        // Supabase handles the redirect automatically
    } catch (error) {
        showError(error.message);
    }
});

// Email/Password Sign-In Handler
signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        showSuccess('Signed in successfully! Checking subscription...');

        // Check subscription tier and onboarding status
        const { data: user } = await supabase.auth.getUser();
        if (user && user.user) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('subscription_tier, onboarding_complete')
                .eq('id', user.user.id)
                .single();

            if (profile) {
                if (profile.subscription_tier === 'paid') {
                    window.location.href = 'download.html';
                } else if (profile.onboarding_complete) {
                    window.location.href = 'onboarding-paywall.html';
                } else {
                    window.location.href = 'onboarding.html';
                }
            } else {
                window.location.href = 'onboarding.html';
            }
        } else {
            // Fallback if user fetch fails (unlikely after sign in)
            window.location.href = 'onboarding.html';
        }

    } catch (error) {
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign in';
    }
});
