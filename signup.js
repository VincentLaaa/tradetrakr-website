
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
        console.log('Google Sign-Up button clicked');

        if (!supabase) {
            showError('System error: Database connection failed.');
            return;
        }

        try {
            console.log('Disabling button and showing loading state');
            googleBtn.disabled = true;
            googleBtn.innerHTML = 'Connecting...';

            console.log('Initiating Supabase OAuth sign-up...');
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

            if (error) {
                console.error('Supabase OAuth error:', error);
                throw error;
            }

            console.log('Supabase OAuth initiated successfully:', data);
            // Supabase handles the redirect automatically

        } catch (error) {
            console.error('Catch block error:', error);
            showError(error.message || 'Failed to sign up with Google. Please try again.');
            googleBtn.disabled = false;
            googleBtn.innerHTML = originalButtonHTML;
        }
    });
} else {
    console.error('Google button not found in DOM');
    showError('Page error: Sign up button not found. Please refresh the page.');
}

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
