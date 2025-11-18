/**
 * TypeScript types for onboarding flow
 */

export type OnboardingAnswers = {
  experienceLevel?: string;
  propFirms?: string[];
  biggestPain?: string;
  failedEvalsBand?: string;
  email?: string;
};

export type OnboardingStepId =
  | 'welcome'
  | 'profile_experience'
  | 'prop_firms'
  | 'biggest_pain'
  | 'failed_evals'
  | 'encouragement'
  | 'email_capture'
  | 'pricing';

export type OnboardingStep = {
  id: OnboardingStepId;
  title: string;
  description?: string;
  renderContent: (props: {
    answers: OnboardingAnswers;
    updateAnswer: (key: keyof OnboardingAnswers, value: any) => void;
    onNext: () => void;
    onPrev: () => void;
    canGoNext: boolean;
  }) => React.ReactNode;
};

export type OnboardingSubmission = {
  sessionId: string;
  answers: OnboardingAnswers;
  completed: boolean;
  lastStepId: string;
  source?: string;
};

