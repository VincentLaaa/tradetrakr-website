
// Initialize Supabase Client
// REPLACE WITH YOUR ACTUAL SUPABASE URL AND ANON KEY
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

// Helper to ensure profile exists
async function ensureProfileExists(userId) {
    try {
        // Check if profile already exists
        const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

        if (existingProfile) {
            // Profile already exists
            return true;
        }

        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                subscription_tier: 'free',
                onboarding_complete: false
            });

        if (insertError) {
            console.error('Error creating profile:', insertError);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error ensuring profile exists:', error);
        return false;
    }
}

// Check for OAuth callback on page load
(async function handleOAuthCallback() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (session && session.user) {
        // User just signed up/in via OAuth
        showSuccess('Account created successfully! Setting up your profile...');

        // Ensure profile exists
        await ensureProfileExists(session.user.id);

        // Redirect to onboarding
        window.location.href = 'onboarding.html';
    }
})();

// Google Sign-Up Handler
googleBtn.addEventListener('click', async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/signup.html`,
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
            options: {
                emailRedirectTo: `${window.location.origin}/signup.html`
            }
        });

        if (error) throw error;

        if (data.user) {
            // Account created
            showSuccess('Account created successfully! Setting up your profile...');

            // Ensure profile exists
            await ensureProfileExists(data.user.id);

            // If session exists (email confirmation disabled), redirect immediately
            if (data.session) {
                setTimeout(() => {
                    window.location.href = 'onboarding.html';
                }, 1000);
            } else {
                // Email confirmation required
                showSuccess('Account created! Please check your email to confirm your registration, then sign in.');
                signupForm.reset();
            }
        }
    } catch (error) {
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign up';
    }
});
