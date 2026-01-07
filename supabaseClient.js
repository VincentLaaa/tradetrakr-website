// supabaseClient.js
const supabaseUrl = 'https://afqsiqoksuuddplockbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcXNpcW9rc3V1ZGRwbG9ja2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MjM2NjksImV4cCI6MjA3ODk5OTY2OX0.drzxOAIUZP3ZhrdqGCJOAzBM8oaeOqVfVp7ATbacNoo';

// Use the Supabase JS loaded from CDN: window.supabase
if (typeof window !== 'undefined' && window.supabase) {
  window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  console.log('Supabase client initialized successfully');
  
  // Global OAuth callback handler: Redirect new users to onboarding
  // This runs immediately after Supabase processes the OAuth callback
  (async function handleOAuthCallback() {
    // Check if this is an OAuth callback (has hash with session tokens)
    const hasAuthHash = window.location.hash && (
      window.location.hash.includes('access_token') || 
      window.location.hash.includes('type=recovery')
    );
    
    // Also check if we're on a page that shouldn't have auth redirects
    const currentPage = window.location.pathname.split('/').pop() || '';
    const isOnboardingPage = currentPage === 'onboarding.html' || currentPage === 'onboarding-profile.html' || 
                             currentPage === 'onboarding-broker.html' || currentPage === 'onboarding-assets.html' ||
                             currentPage === 'onboarding-goals.html' || currentPage === 'onboarding-referral.html' ||
                             currentPage === 'onboarding-final.html';
    
    if (hasAuthHash || isOnboardingPage) {
      // Wait a bit for Supabase to process the session
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const supabase = window.supabaseClient;
        if (!supabase) return;
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (!userError && user) {
          // Check if this is a new user
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_complete, subscription_tier')
            .eq('id', user.id)
            .single();
          
          // If new user (no onboarding_complete) and NOT already on onboarding page
          if ((!profile || !profile.onboarding_complete) && !isOnboardingPage) {
            console.log('OAuth callback detected - new user, redirecting to onboarding...');
            // Clear hash and redirect to onboarding
            window.location.replace(window.location.origin + '/onboarding.html');
            return;
          }
          
          // If we're on onboarding page, clear the hash but stay here
          if (isOnboardingPage && hasAuthHash) {
            window.history.replaceState(null, null, window.location.pathname);
          }
        }
      } catch (error) {
        console.error('Error in OAuth callback handler:', error);
      }
    }
  })();
} else {
  console.error('Supabase CDN script not loaded. Make sure to include it before supabaseClient.js');
}




