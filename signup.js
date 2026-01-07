
// Wait for DOM and Supabase to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Signup script loaded - DOM ready');
    
    // Get DOM elements first
    const googleBtn = document.getElementById('google-btn');
    const signupForm = document.getElementById('signup-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submit-btn');
    const errorMsg = document.getElementById('error-msg');
    const successMsg = document.getElementById('success-msg');

    // Wait for Supabase client to be initialized
    function waitForSupabase(callback, maxAttempts = 10) {
        let attempts = 0;
        const checkSupabase = setInterval(() => {
            attempts++;
            if (window.supabaseClient) {
                clearInterval(checkSupabase);
                console.log('Supabase client found after', attempts, 'attempts');
                callback();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkSupabase);
                console.error('Supabase client not found after', maxAttempts, 'attempts');
                if (errorMsg) {
                    errorMsg.textContent = 'System error: Database connection failed. Please refresh the page.';
                    errorMsg.style.display = 'block';
                }
            }
        }, 100);
    }

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

    // Initialize once Supabase is ready
    waitForSupabase(() => {
        const supabase = window.supabaseClient;
        
        if (!supabase) {
            console.error('Supabase client not found. Ensure supabaseClient.js is loaded.');
            showError('System error: Database connection failed. Please refresh the page.');
            return;
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
            console.log('Redirect URL:', window.location.origin + '/onboarding.html');
            
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
                console.error('Error details:', JSON.stringify(error, null, 2));
                
                // Check for common OAuth configuration errors
                if (error.message && error.message.includes('redirect')) {
                    showError('OAuth redirect URL not configured. Please check your Supabase settings.');
                } else if (error.message && error.message.includes('provider')) {
                    showError('Google OAuth provider not enabled. Please enable it in your Supabase dashboard.');
                } else {
                    showError(error.message || 'Failed to sign up with Google. Please check your Supabase OAuth configuration.');
                }
                throw error;
            }

            console.log('Supabase OAuth initiated successfully:', data);
            
            // If we get here but no redirect happens, there might be an issue
            if (!data || !data.url) {
                throw new Error('OAuth flow failed to start. Please check your Supabase OAuth configuration in the dashboard.');
            }
            
            // Supabase handles the redirect automatically

        } catch (error) {
            console.error('Catch block error:', error);
            const errorMessage = error.message || 'Failed to sign up with Google. Please try again.';
            
            // Provide helpful guidance for common issues
            if (errorMessage.includes('OAuth') || errorMessage.includes('provider') || errorMessage.includes('redirect')) {
                showError(errorMessage + ' If your Supabase was recently reactivated, you may need to reconfigure Google OAuth in your Supabase dashboard.');
            } else {
                showError(errorMessage);
            }
            
            googleBtn.disabled = false;
            googleBtn.innerHTML = originalButtonHTML;
        }
    });
        } else {
            console.error('Google button not found in DOM');
            showError('Page error: Sign up button not found. Please refresh the page.');
        }

        // Email/Password Sign-Up Handler
        if (signupForm) {
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
            showSuccess('Account created successfully! Redirecting to onboarding...');

            // All new users should go to onboarding first
            // They can only access download.html after completing onboarding and having a valid license
            window.location.href = 'onboarding.html';
        }
    } catch (error) {
        showError(error.message);
    } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign up';
            }
            });
        }
    });
});
