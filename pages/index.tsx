import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import OnboardingModal from '@/components/OnboardingModal';
import { trackEvent } from '@/lib/posthogClient';

export default function Home() {
  const router = useRouter();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const handleGetStartedClick = () => {
    trackEvent('landing_get_started_clicked', {
      pagePath: router.pathname,
    });
    setIsOnboardingOpen(true);
  };

  const handleOnboardingClose = () => {
    setIsOnboardingOpen(false);
  };

  const handleOnboardingCompleted = () => {
    // TODO: Handle signup flow or redirect to signup page
    // For now, just close the modal
    setIsOnboardingOpen(false);
    // Example: router.push('/signup');
  };

  return (
    <>
      <Head>
        <title>TradeTrakR - Turn your funded accounts into consistent payouts</title>
        <meta
          name="description"
          content="Professional trading journal and prop-firm toolkit for serious traders"
        />
      </Head>

      <div className="min-h-screen bg-gray-950 text-white">
        {/* Hero Section */}
        <section className="relative px-4 py-20 md:py-32">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Turn your funded accounts into consistent payouts.
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 mb-10">
                TradeTrakR helps you track your trades, manage your psychology, and pass prop firm
                evaluations with confidence.
              </p>
              <button
                onClick={handleGetStartedClick}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg rounded-lg hover:opacity-90 transition-opacity shadow-lg"
              >
                Get Started Free
              </button>
              <button
                onClick={() => {
                  console.log('[DEBUG BUTTON] Manual test triggered');
                  trackEvent('debug_manual_test', { from: 'index_debug_button' });
                  fetch('/api/onboarding/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      sessionId: 'debug-session-123',
                      answers: {
                        experienceLevel: 'Funded but inconsistent',
                        email: 'test@example.com',
                      },
                      completed: false,
                      lastStepId: 'welcome',
                      source: 'debug_button',
                    }),
                  })
                    .then((r) => r.json())
                    .then((json) => console.log('[DEBUG BUTTON] API response', json))
                    .catch((e) => console.error('[DEBUG BUTTON] API error', e));
                }}
                className="mt-4 px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
              >
                🐛 Debug Test
              </button>
            </div>
          </div>
        </section>

        {/* Features Section (placeholder - can be expanded) */}
        <section className="px-4 py-20 bg-gray-900/50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why TradeTrakR?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold mb-3">Track Everything</h3>
                <p className="text-gray-400">
                  Log every trade, track your rules, and monitor your psychology in one place.
                </p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold mb-3">Pass Evaluations</h3>
                <p className="text-gray-400">
                  Built specifically for prop firm traders who want to pass and stay funded.
                </p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold mb-3">Stay Consistent</h3>
                <p className="text-gray-400">
                  Identify patterns, fix weaknesses, and build profitable trading habits.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={handleOnboardingClose}
        onCompleted={handleOnboardingCompleted}
        entryPoint="hero_cta"
      />
    </>
  );
}

