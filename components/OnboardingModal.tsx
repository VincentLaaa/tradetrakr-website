'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackEvent } from '@/lib/posthogClient';
import type { OnboardingAnswers, OnboardingStepId } from '@/lib/types/onboarding';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
  entryPoint?: string;
}

const STORAGE_KEY = 'tradetrakr_onboarding_session_id';

// Email capture step component (needs its own state)
function EmailCaptureStep({
  answers,
  updateAnswer,
  onNext,
  handleAnswerSubmit,
}: {
  answers: OnboardingAnswers;
  updateAnswer: (key: keyof OnboardingAnswers, value: any) => void;
  onNext: () => void;
  handleAnswerSubmit: (
    stepId: OnboardingStepId,
    questionId: string,
    answerType: string,
    answerPreview: string
  ) => void;
}) {
  const [email, setEmail] = useState(answers.email || '');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (answers.email) {
      setEmail(answers.email);
      setIsValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email));
    }
  }, [answers.email]);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleChange = (value: string) => {
    setEmail(value);
    const valid = validateEmail(value);
    setIsValid(valid);
    updateAnswer('email', value);
  };

  const handleSubmit = () => {
    if (isValid && email) {
      handleAnswerSubmit('email_capture', 'email', 'email', email.substring(0, 20) + '...');
      onNext();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">
        Where should we send your TradeTrakR login and setup guide?
      </h2>
      <div className="mb-6">
        <input
          type="email"
          value={email}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {email && !isValid && (
          <p className="mt-2 text-sm text-red-400">Please enter a valid email address</p>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}

/**
 * Generate or retrieve onboarding session ID
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let sessionId = localStorage.getItem(STORAGE_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Save onboarding data to server
 */
async function saveOnboardingToServer({
  sessionId,
  answers,
  completed,
  lastStepId,
  source = 'homepage_hero',
}: {
  sessionId: string;
  answers: OnboardingAnswers;
  completed: boolean;
  lastStepId: string;
  source?: string;
}) {
  try {
    const response = await fetch('/api/onboarding/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        answers,
        completed,
        lastStepId,
        source,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Failed to save onboarding:', error);
    }
  } catch (err) {
    console.error('Error saving onboarding data:', err);
  }
}

export default function OnboardingModal({
  isOpen,
  onClose,
  onCompleted,
  entryPoint = 'hero_cta',
}: OnboardingModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [sessionId, setSessionId] = useState<string>('');
  const [hasTrackedStart, setHasTrackedStart] = useState(false);

  // Initialize session ID on mount
  useEffect(() => {
    if (isOpen && !sessionId) {
      const id = getOrCreateSessionId();
      setSessionId(id);
    }
  }, [isOpen, sessionId]);

  // Track onboarding start
  useEffect(() => {
    if (isOpen && !hasTrackedStart && sessionId) {
      trackEvent('onboarding_started', { entryPoint });
      setHasTrackedStart(true);
    }
  }, [isOpen, hasTrackedStart, entryPoint, sessionId]);

  // Track step view
  useEffect(() => {
    if (isOpen && sessionId) {
      const stepId = STEPS[currentStepIndex]?.id;
      if (stepId) {
        trackEvent('onboarding_step_viewed', {
          stepId,
          stepIndex: currentStepIndex,
        });
      }
    }
  }, [currentStepIndex, isOpen, sessionId]);

  const updateAnswer = useCallback((key: keyof OnboardingAnswers, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex >= STEPS.length - 1) {
      return; // Already at last step
    }

    const currentStep = STEPS[currentStepIndex];
    if (currentStep) {
      trackEvent('onboarding_step_completed', {
        stepId: currentStep.id,
        stepIndex: currentStepIndex,
      });
    }

    setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, [currentStepIndex]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleClose = useCallback(async () => {
    const currentStep = STEPS[currentStepIndex];
    trackEvent('onboarding_closed', {
      stepId: currentStep?.id || 'unknown',
      reason: 'manual_close',
    });

    // Save partial progress
    if (sessionId && currentStep) {
      await saveOnboardingToServer({
        sessionId,
        answers,
        completed: false,
        lastStepId: currentStep.id,
        source: entryPoint,
      });
    }

    onClose();
  }, [currentStepIndex, answers, sessionId, entryPoint, onClose]);

  const handleAnswerSubmit = useCallback(
    (
      stepId: OnboardingStepId,
      questionId: string,
      answerType: string,
      answerPreview: string
    ) => {
      trackEvent('onboarding_answer_submitted', {
        stepId,
        questionId,
        answerType,
        answerPreview,
      });
    },
    []
  );

  const handlePricingClick = useCallback(async () => {
    trackEvent('signup_submitted', {
      source: 'onboarding',
      planSelected: 'default',
    });

    // Save as completed
    if (sessionId) {
      await saveOnboardingToServer({
        sessionId,
        answers,
        completed: true,
        lastStepId: 'pricing',
        source: entryPoint,
      });
    }

    if (onCompleted) {
      onCompleted();
    } else {
      // TODO: Redirect to signup page or handle signup flow
      // router.push('/signup');
      handleClose();
    }
  }, [sessionId, answers, entryPoint, onCompleted, handleClose]);

  if (!isOpen) {
    return null;
  }

  const currentStep = STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;
  const canGoNext = currentStepIndex < STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl mx-4 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Progress indicator */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStepIndex + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 py-8">
          {currentStep?.renderContent({
            answers,
            updateAnswer,
            onNext: nextStep,
            onPrev: prevStep,
            canGoNext,
            handleAnswerSubmit,
            handlePricingClick,
          })}
        </div>
      </div>
    </div>
  );
}

// Step definitions
const STEPS = [
  {
    id: 'welcome' as const,
    title: "You're serious about your trading.",
    description: "Let's customize your dashboard based on how you trade.",
    renderContent: ({ onNext }: any) => (
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          You're serious about your trading.
        </h2>
        <p className="text-gray-400 mb-8 text-lg">
          Let's customize your dashboard based on how you trade.
        </p>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Continue
        </button>
      </div>
    ),
  },
  {
    id: 'profile_experience' as const,
    title: 'Which best describes you?',
    renderContent: ({ answers, updateAnswer, onNext, handleAnswerSubmit }: any) => {
      const options = [
        'New to futures / prop trading',
        'Still trying to pass an evaluation',
        'Funded but inconsistent',
        'Consistently profitable and scaling',
      ];

      const handleSelect = (value: string) => {
        updateAnswer('experienceLevel', value);
        handleAnswerSubmit('profile_experience', 'experience_level', 'single_choice', value);
        setTimeout(onNext, 300);
      };

      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Which best describes you?</h2>
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  answers.experienceLevel === option
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    id: 'prop_firms' as const,
    title: 'Which prop firms are you trading with right now?',
    renderContent: ({ answers, updateAnswer, onNext, handleAnswerSubmit }: any) => {
      const options = ['Apex', 'Topstep', 'MyFundedFX', 'FTMO', 'Other / None'];

      const handleToggle = (firm: string) => {
        const current = answers.propFirms || [];
        const updated = current.includes(firm)
          ? current.filter((f: string) => f !== firm)
          : [...current, firm];
        updateAnswer('propFirms', updated);
      };

      const handleNext = () => {
        const selected = answers.propFirms || [];
        if (selected.length > 0) {
          handleAnswerSubmit(
            'prop_firms',
            'prop_firms',
            'multi_select',
            selected.join(', ')
          );
          onNext();
        }
      };

      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Which prop firms are you trading with right now?
          </h2>
          <p className="text-gray-400 mb-6 text-sm">Select all that apply</p>
          <div className="space-y-3 mb-6">
            {options.map((firm) => (
              <label
                key={firm}
                className="flex items-center px-4 py-3 rounded-lg border-2 border-gray-700 bg-gray-800/50 cursor-pointer hover:border-gray-600 transition-all"
              >
                <input
                  type="checkbox"
                  checked={(answers.propFirms || []).includes(firm)}
                  onChange={() => handleToggle(firm)}
                  className="w-5 h-5 text-blue-500 rounded border-gray-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-gray-300">{firm}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={(answers.propFirms || []).length === 0}
            className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      );
    },
  },
  {
    id: 'biggest_pain' as const,
    title: "What's your biggest struggle with trading right now?",
    renderContent: ({ answers, updateAnswer, onNext, handleAnswerSubmit }: any) => {
      const options = [
        "Breaking my rules when I'm up or down",
        'Inconsistent journaling and review',
        'Sizing too big and blowing days',
        'Failing prop evaluations repeatedly',
        'Emotions and tilt',
      ];

      const handleSelect = (value: string) => {
        updateAnswer('biggestPain', value);
        handleAnswerSubmit('biggest_pain', 'biggest_pain', 'single_choice', value);
        setTimeout(onNext, 300);
      };

      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            What's your biggest struggle with trading right now?
          </h2>
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  answers.biggestPain === option
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    id: 'failed_evals' as const,
    title: 'How many prop evaluations have you failed so far?',
    renderContent: ({ answers, updateAnswer, onNext, handleAnswerSubmit }: any) => {
      const options = ['0', '1–2', '3–5', '6+'];

      const handleSelect = (value: string) => {
        updateAnswer('failedEvalsBand', value);
        handleAnswerSubmit('failed_evals', 'failed_evals_band', 'banded_numeric', value);
        setTimeout(onNext, 300);
      };

      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            How many prop evaluations have you failed so far?
          </h2>
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  answers.failedEvalsBand === option
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    id: 'encouragement' as const,
    title: 'Perfect fit',
    renderContent: ({ answers, onNext }: any) => {
      const experienceLevel = answers.experienceLevel || 'trader';
      const propFirms = answers.propFirms || [];
      const propFirmsJoined = propFirms.length > 0 ? propFirms.join(', ') : 'various firms';
      const biggestPain = answers.biggestPain || 'improving your trading';

      return (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Perfect fit</h2>
          <p className="text-gray-400 mb-6 text-lg">
            You're a <span className="text-white font-semibold">{experienceLevel}</span> trader
            {propFirms.length > 0 && (
              <>
                {' '}
                trading with <span className="text-white font-semibold">{propFirmsJoined}</span>
              </>
            )}
            . The main friction is{' '}
            <span className="text-white font-semibold">{biggestPain}</span>. TradeTrakR is built
            exactly for this.
          </p>
          <button
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </div>
      );
    },
  },
  {
    id: 'email_capture' as const,
    title: 'Where should we send your TradeTrakR login and setup guide?',
    renderContent: EmailCaptureStep,
  },
  {
    id: 'pricing' as const,
    title: 'Start your free trial',
    renderContent: ({ onNext, handlePricingClick }: any) => {
      return (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start your free trial</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Get started with TradeTrakR and take control of your trading journey.
          </p>
          <button
            onClick={handlePricingClick}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Free Trial
          </button>
        </div>
      );
    },
  },
];


