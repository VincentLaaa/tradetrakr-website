
// Initialize Supabase Client
// Using the keys provided by the user
const supabaseUrl = 'https://afqsiqoksuuddplockbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcXNpcW9rc3V1ZGRwbG9ja2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MjM2NjksImV4cCI6MjA3ODk5OTY2OX0.drzxOAIUZP3ZhrdqGCJOAzBM8oaeOqVfVp7ATbacNoo';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

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

// Helper to check profile and redirect
async function checkProfileAndRedirect(userId) {
    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_tier, onboarding_complete')
            .eq('id', userId)
            .single();

        if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, redirect to onboarding
            window.location.href = 'onboarding.html';
            return;
        }

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
    } catch (error) {
        console.error('Error checking profile:', error);
        window.location.href = 'onboarding.html';
    }
}

// Check for OAuth callback on page load
(async function handleOAuthCallback() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (session && session.user) {
        // User just signed in via OAuth
        showSuccess('Signed in successfully! Redirecting...');
        await checkProfileAndRedirect(session.user.id);
    }
})();

// Google Sign-In Handler
googleBtn.addEventListener('click', async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/signin.html`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
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
        await checkProfileAndRedirect(data.user.id);

    } catch (error) {
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign in';
    }
});
