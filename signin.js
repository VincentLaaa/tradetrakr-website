
console.log('Signin script loaded');
// Use shared Supabase client
const supabase = window.supabaseClient;

const googleBtn = document.getElementById('google-btn');
console.log('Google button found:', googleBtn);
const signinForm = document.getElementById('signin-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const errorMsg = document.getElementById('error-msg');
const successMsg = document.getElementById('success-msg');

// Helper to show errors
function showError(message) {
    if (errorMsg) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        if (successMsg) successMsg.style.display = 'none';
    }
}

// Helper to show success
function showSuccess(message) {
    if (successMsg) {
        successMsg.textContent = message;
        successMsg.style.display = 'block';
        if (errorMsg) errorMsg.style.display = 'none';
    }
}

// Check if Supabase client is available
if (!supabase) {
    console.error('Supabase client not found. Ensure supabaseClient.js is loaded.');
    showError('System error: Database connection failed. Please refresh the page.');
}

// Google Sign-In Handler
if (googleBtn) {
    const originalButtonHTML = googleBtn.innerHTML;
    
    googleBtn.addEventListener('click', async () => {
        console.log('Google Sign-In button clicked');

        if (!supabase) {
            showError('System error: Database connection failed.');
            return;
        }

        try {
            googleBtn.disabled = true;
            googleBtn.innerHTML = 'Connecting...';

            console.log('Initiating Supabase OAuth sign-in...');
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

            if (error) {
                console.error('Supabase OAuth error:', error);
                throw error;
            }

            console.log('Supabase OAuth initiated successfully:', data);
            // Supabase handles the redirect automatically

        } catch (error) {
            console.error('Catch block error:', error);
            showError(error.message || 'Failed to sign in with Google. Please try again.');
            googleBtn.disabled = false;
            googleBtn.innerHTML = originalButtonHTML;
        }
    });
} else {
    console.error('Google button not found in DOM');
    showError('Page error: Sign in button not found. Please refresh the page.');
}

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
