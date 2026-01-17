'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { SavingsSlider } from './SavingsSlider';
import { AllocationSlider } from './AllocationSlider';
import { ProcessingState } from './ProcessingState';
import { extractUTMParameters, storeUTMParameters, getStoredUTMParameters, hasUTMParameters, UTMParameters } from '@/utils/utm-utils';
import { trackUTMParameters } from '@/utils/utm-tracker';
import { getAssignedVariant, QuizVariant, getAssignedEntryVariant, EntryVariant } from '@/utils/variant-assignment';
import { 
  initializeTracking, 
  trackQuestionAnswer, 
  trackLeadFormSubmit, 
  trackPageView, 
  trackQuizStart, 
  trackQuizComplete,
  sendCAPIViewContentEventMultiSite,
  trackQuizStepViewed,
  LeadData
} from '@/lib/temp-tracking';
import { formatPhoneForGHL } from '@/utils/phone-utils';

interface QuizAnswer {
  [key: string]: any;
}

// RMD Quiz Questions - 8 Steps
const RMD_QUIZ_QUESTIONS = [
  {
    id: 'rmd_concern',
    title: 'Are you currently concerned about Required Minimum Distributions (RMDs) increasing your taxes in retirement?',
    subtitle: '',
    type: 'multiple-choice' as const,
    options: [
      'Yes — I\'m worried RMDs could increase my taxes',
      'I\'m not sure, but I want to find out',
      'I don\'t think RMDs will affect me'
    ],
  },
  {
    id: 'age_range',
    title: 'Which age range are you in?',
    subtitle: 'We use age to estimate when RMD rules may apply.',
    type: 'multiple-choice' as const,
    options: [
      'Under 55',
      '55–59',
      '60–64',
      '65–69',
      '70–75',
      'Over 75'
    ],
  },
  {
    id: 'retire_timeline',
    title: 'How soon are you planning to retire (or did you already retire)?',
    subtitle: 'Some tax strategies are easier to implement before RMDs begin.',
    type: 'multiple-choice' as const,
    options: [
      'Already retired',
      'Within 1–2 years',
      '3–5 years',
      '6–10 years',
      'More than 10 years'
    ],
  },
  {
    id: 'risk_tolerance',
    title: 'Which best describes your approach to market risk right now?',
    subtitle: '',
    type: 'multiple-choice' as const,
    options: [
      'Conservative — I want to protect my principal',
      'Moderate — Some growth, but protection matters',
      'Aggressive — I\'m comfortable with market swings'
    ],
  },
  {
    id: 'account_types',
    title: 'Which retirement accounts do you currently have?',
    subtitle: 'Select all that apply.',
    type: 'multi-select' as const,
    options: [
      '401(k) or 403(b)',
      'Traditional IRA',
      'Pension',
      'Annuities',
      'Taxable investment accounts',
      'None of the above'
    ],
  },
  {
    id: 'total_savings',
    title: 'About how much do you have saved across all retirement accounts?',
    subtitle: 'Based on your savings level, RMD-related taxes could materially impact your retirement income if left unaddressed.',
    type: 'savings-slider' as const,
    min: 50000,
    max: 2000000,
    step: 25000,
    defaultValue: 250000,
    unit: '$',
  },
  {
    id: 'protect_allocation',
    title: 'What portion of your retirement savings would you like to protect from market volatility and forced withdrawals?',
    subtitle: '',
    type: 'allocation-slider' as const,
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 25,
    unit: '%',
    showValue: true,
  },
  {
    id: 'lead_form',
    title: 'See If You Qualify for a Retirement Rescue™ Strategy',
    subtitle: 'Based on your answers, we\'ll send you personalized guidance showing whether a tax-efficient, RMD-aware strategy may be available to you.',
    type: 'personal-info-with-benefits' as const,
    benefits: [
      'Personalized RMD tax strategy assessment',
      'Educational guidance on tax-efficient strategies',
      'No obligation — see if this applies to you'
    ],
  },
];

interface RMDQuizProps {
  onStepChange?: (step: number) => void;
}

export const RMDQuiz = ({ onStepChange }: RMDQuizProps) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>({});
  const [variant, setVariant] = useState<QuizVariant>('rmd_v1');
  const [entryVariant, setEntryVariant] = useState<EntryVariant>('immediate_q1');
  const [hasStarted, setHasStarted] = useState(false); // For Variant A (start button)
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const [utmParams, setUtmParams] = useState<UTMParameters | null>(null);
  
  // Step tracking state for time-on-step analytics
  const [previousStep, setPreviousStep] = useState<string | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  
  // Inactivity tracking
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const questions = RMD_QUIZ_QUESTIONS;
  const totalSteps = questions.length;

  // Helper function to get session ID
  const getSessionId = (): string => {
    if (typeof window !== 'undefined') {
      const storedSessionId = sessionStorage.getItem('session_id');
      if (storedSessionId) {
        return storedSessionId;
      }
    }
    return sessionId || 'unknown';
  };

  // Initialize quiz on mount
  useEffect(() => {
    // Generate or retrieve session ID
    let newSessionId: string;
    if (typeof window !== 'undefined') {
      const storedSessionId = sessionStorage.getItem('session_id');
      if (storedSessionId) {
        newSessionId = storedSessionId;
      } else {
        // Generate UUID v4 using crypto API
        newSessionId = crypto.randomUUID();
        sessionStorage.setItem('session_id', newSessionId);
      }
    } else {
      // SSR fallback - will be regenerated on client
      newSessionId = `rmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    setSessionId(newSessionId);

    // Get assigned variants
    const assignedVariant = getAssignedVariant();
    setVariant(assignedVariant);
    
    const assignedEntryVariant = getAssignedEntryVariant();
    setEntryVariant(assignedEntryVariant);
    
    // For Variant A (start_button), quiz hasn't started yet
    if (assignedEntryVariant === 'start_button') {
      setHasStarted(false);
    } else {
      setHasStarted(true); // Variant B shows Q1 immediately
    }

    // Initialize tracking
    initializeTracking();
    
    // Track page view
    trackPageView('SeniorSimple RMD Quiz', '/quiz-rmd');
    
    // Track quiz view event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'quiz_view', {
        route: '/quiz-rmd',
        variant: assignedVariant,
        entry_variant: assignedEntryVariant,
        session_id: newSessionId,
        referrer: document.referrer || '',
        utm_source: utmParams?.utm_source || '',
        utm_medium: utmParams?.utm_medium || '',
        utm_campaign: utmParams?.utm_campaign || '',
      });
    }

    // Track quiz start (only if entry variant is immediate_q1, start_button tracks on button click)
    if (assignedEntryVariant === 'immediate_q1') {
      trackQuizStart('rmd-quiz', newSessionId);
    }
    
    // Send CAPI ViewContent event
    sendCAPIViewContentEventMultiSite({
      quizType: 'rmd-quiz',
      sessionId: newSessionId
    });

    // Track quiz start time
    if (typeof window !== 'undefined') {
      (window as any).quizStartTime = Date.now();
    }

    // UTM Tracking
    const extractAndTrackUTM = async () => {
      const utmTracked = sessionStorage.getItem('utm_tracked');
      if (utmTracked === 'true') {
        const storedUtm = getStoredUTMParameters();
        if (storedUtm) {
          setUtmParams(storedUtm);
        }
        return;
      }

      const utmData = extractUTMParameters();
      if (hasUTMParameters(utmData)) {
        setUtmParams(utmData);
        storeUTMParameters(utmData);
        const trackingSuccess = await trackUTMParameters(newSessionId, utmData);
        if (trackingSuccess) {
          sessionStorage.setItem('utm_tracked', 'true');
        }
      } else {
        const storedUtm = getStoredUTMParameters();
        if (storedUtm) {
          setUtmParams(storedUtm);
        }
      }
    };

    extractAndTrackUTM();

    // Set up inactivity tracking
    const resetInactivityTimer = () => {
      lastActivityRef.current = Date.now();
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        if (document.hidden) {
          // Track exit event
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'quiz_exit', {
              last_step: currentStep + 1,
              route: '/quiz-rmd',
              variant: assignedVariant,
              entry_variant: assignedEntryVariant,
              session_id: newSessionId,
            });
          }
        }
      }, 20000); // 20 seconds
    };

    const handleActivity = () => resetInactivityTimer();
    const handleVisibilityChange = () => {
      if (document.hidden && Date.now() - lastActivityRef.current > 20000) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'quiz_exit', {
            last_step: currentStep + 1,
            route: '/quiz-rmd',
            variant: assignedVariant,
            session_id: newSessionId,
          });
        }
      }
    };

    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    resetInactivityTimer();

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  // Notify parent component when step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  // Track quiz step views with time tracking
  useEffect(() => {
    if (currentStep >= 0 && currentStep < questions.length && sessionId) {
      const currentQuestion = questions[currentStep];
      const timeOnPrevious = previousStep 
        ? Math.round((Date.now() - stepStartTime) / 1000) 
        : null;
      
      // Track step view event
      trackQuizStepViewed({
        stepNumber: currentStep + 1,
        stepName: currentQuestion.id,
        funnelType: 'rmd-quiz',
        previousStep: previousStep,
        timeOnPreviousStep: timeOnPrevious,
        sessionId: getSessionId()
      });

      // Track quiz_step_view event (GA4)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'quiz_step_view', {
          step: currentStep + 1,
          step_key: currentQuestion.id,
          route: '/quiz-rmd',
          variant: variant,
          entry_variant: entryVariant,
          session_id: getSessionId(),
        });
      }

      // Track lead_form_view on step 8
      if (currentStep === 7) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'lead_form_view', {
            route: '/quiz-rmd',
            variant: variant,
            entry_variant: entryVariant,
            session_id: getSessionId(),
          });
        }
      }
      
      // Update tracking state for next step
      setPreviousStep(currentQuestion.id);
      setStepStartTime(Date.now());
      
      console.log('📊 Quiz Step Tracked:', {
        step: currentStep + 1,
        stepName: currentQuestion.id,
        funnelType: 'rmd-quiz',
        timeOnPreviousStep: timeOnPrevious,
        sessionId: getSessionId()
      });
    }
  }, [currentStep, questions, previousStep, stepStartTime, sessionId, variant]);

  const handleAnswer = async (answer: any) => {
    const currentQuestion = questions[currentStep];
    
    // Track question answer
    try {
      trackQuestionAnswer(currentQuestion.id, answer, currentStep + 1, questions.length, getSessionId(), 'rmd-quiz');
    } catch {}

      // Track quiz_step_answer event (GA4)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'quiz_step_answer', {
          step: currentStep + 1,
          step_key: currentQuestion.id,
          answer: typeof answer === 'object' ? JSON.stringify(answer) : answer,
          route: '/quiz-rmd',
          variant: variant,
          entry_variant: entryVariant,
          session_id: getSessionId(),
        });
      }

      // Track quiz_start on first answer (for immediate_q1 variant only, start_button tracks on button click)
      if (currentStep === 0 && entryVariant === 'immediate_q1') {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'quiz_start', {
            step: 1,
            route: '/quiz-rmd',
            variant: variant,
            entry_variant: entryVariant,
            session_id: getSessionId(),
          });
        }
      }

    const updatedAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(updatedAnswers);

    // Handle final submission on step 8 (lead form)
    if (currentStep === 7) {
      console.log('📝 Final Submission (Step 8 - Lead Form):', {
        firstName: answer.firstName,
        lastName: answer.lastName,
        email: answer.email,
        phone: answer.phone,
        sessionId: getSessionId()
      });
      
      setShowProcessing(true);
      
      try {
        // Capture TrustedForm certificate URL
        const trustedFormCertUrl = typeof document !== 'undefined' 
          ? (document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement)?.value || ''
          : '';

        // Track lead submit attempt
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'lead_submit_attempt', {
            route: '/quiz-rmd',
            variant: variant,
            entry_variant: entryVariant,
            session_id: getSessionId(),
          });
        }

        // Track lead form submit
        trackLeadFormSubmit({
          firstName: answer.firstName,
          lastName: answer.lastName,
          email: answer.email,
          phoneNumber: answer.phone,
          sessionId: getSessionId(),
          funnelType: 'rmd-quiz',
          leadScore: 75,
          quizAnswers: updatedAnswers,
          zipCode: '', // RMD quiz doesn't collect ZIP
        });

        // Submit to API
        const response = await fetch('/api/leads/quiz-rmd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: answer.email,
            phoneNumber: answer.phone,
            firstName: answer.firstName,
            lastName: answer.lastName,
            quizAnswers: updatedAnswers,
            sessionId: getSessionId(),
            variant: variant,
            entryVariant: entryVariant,
            route: '/quiz-rmd',
            utmParams: utmParams,
            trustedFormCertUrl: trustedFormCertUrl || null,
          })
        });

        const result = await response.json();
        
        if (result.success && result.lead_id) {
          // Track success
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'lead_submit_success', {
              lead_id: result.lead_id,
              route: '/quiz-rmd',
              variant: variant,
              entry_variant: entryVariant,
              session_id: getSessionId(),
            });
          }

          // Track quiz completion
          try {
            const completionTime = Date.now() - ((window as any).quizStartTime || Date.now());
            trackQuizComplete('rmd-quiz', getSessionId(), 'rmd-quiz', completionTime);
          } catch {}

          // Store answers and navigate to results
          const answersJson = JSON.stringify(updatedAnswers);
          sessionStorage.setItem('quiz_answers', answersJson);
          localStorage.setItem('quiz_answers', answersJson);
          
          setShowProcessing(false);
          router.push(result.next_url || '/quiz-submitted');
        } else {
          throw new Error(result.error || 'Submission failed');
        }
      } catch (error: any) {
        console.error('💥 Form submission error:', error);
        
        // Track error
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'lead_submit_error', {
            error_code: error.status || 'unknown',
            route: '/quiz-rmd',
            variant: variant,
            entry_variant: entryVariant,
            session_id: getSessionId(),
          });
        }

        setShowProcessing(false);
        alert('There was an error submitting your information. Please try again.');
      }
      return;
    }

    // Auto-advance for single-select questions (steps 1-4)
    if (currentStep < 4) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
    } else {
      // For multi-select and sliders, wait for continue button
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const fromStep = currentStep + 1;
      const toStep = currentStep;
      
      // Track back navigation
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'quiz_step_back', {
          from_step: fromStep,
          to_step: toStep,
          route: '/quiz-rmd',
          variant: variant,
          entry_variant: entryVariant,
          session_id: getSessionId(),
        });
      }

      setCurrentStep(currentStep - 1);
    }
  };

  if (showProcessing) {
    return <ProcessingState message="Processing your information..." />;
  }

  // VARIANT A: Start Button (Momentum-First) - Show landing before quiz starts
  if (entryVariant === 'start_button' && !hasStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {/* Above-fold content - Variant A */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#36596A] mb-4 sm:mb-6 leading-tight">
            Are Required Minimum Distributions About to Trigger a Tax Bomb in Your Retirement?
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
            Answer a few quick questions to see if you qualify for a Retirement Rescue™ strategy
            that may help reduce RMD taxes, protect your savings from market losses, and create reliable income.
          </p>
          
          {/* Single Start Button - Dominant CTA */}
          <button
            onClick={() => {
              setHasStarted(true);
              // Track quiz start on button click
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'quiz_start', {
                  step: 1,
                  route: '/quiz-rmd',
                  variant: variant,
                  entry_variant: entryVariant,
                  session_id: getSessionId(),
                });
              }
              // Track quiz start
              trackQuizStart('rmd-quiz', getSessionId());
              // Smooth scroll to quiz content
              setTimeout(() => {
                const quizSection = document.getElementById('quiz-content');
                if (quizSection) {
                  quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
            }}
            className="w-full max-w-[420px] mx-auto bg-[#36596A] text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl"
            style={{ minHeight: '64px' }}
          >
            Start My RMD Risk Check
          </button>
          
          <p className="text-sm text-gray-500 italic mt-6">Educational screening — not financial advice.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const stepLabel = currentQuestion.id === 'rmd_concern' ? 'RMD Risk Check' :
                    currentQuestion.id === 'age_range' ? 'Retirement Stage' :
                    currentQuestion.id === 'retire_timeline' ? 'Retirement Timeline' :
                    currentQuestion.id === 'risk_tolerance' ? 'Market Risk Exposure' :
                    currentQuestion.id === 'account_types' ? 'Accounts Potentially Affected by RMDs' :
                    currentQuestion.id === 'total_savings' ? 'Estimated Tax Exposure' :
                    currentQuestion.id === 'protect_allocation' ? 'Protection Preference' :
                    'Get Your Results';

  return (
    <div id="quiz-content" className="max-w-2xl mx-auto p-6">
      {/* Above-fold content (only on step 1, Variant B) */}
      {currentStep === 0 && entryVariant === 'immediate_q1' && (
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#36596A] mb-4 sm:mb-6 leading-tight">
            Are Required Minimum Distributions About to Trigger a Tax Bomb in Your Retirement?
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-6 leading-relaxed max-w-3xl mx-auto">
            Answer a few quick questions to see if you qualify for a Retirement Rescue™ strategy
            that may help reduce RMD taxes, protect your savings from market losses, and create reliable income.
          </p>
          <div className="space-y-2 mb-4">
            <p className="text-gray-600">✓ Designed for retirees and pre-retirees with $250,000+ in savings</p>
            <p className="text-gray-600">✓ Takes about 60 seconds</p>
            <p className="text-gray-600">✓ No obligation — see if this applies to you</p>
          </div>
          <p className="text-sm text-gray-500 italic">Educational screening — not financial advice.</p>
        </div>
      )}

      {/* Progress Bar - Hidden for Variant A until quiz starts */}
      {(hasStarted || entryVariant === 'immediate_q1') && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {totalSteps} — {stepLabel}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
            </span>
          </div>
          <QuizProgress currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      )}

      {/* Variant-specific scarcity message (step 6, variant 2) */}
      {currentStep === 5 && variant === 'rmd_v1_scarcity_late' && answers.total_savings && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm text-blue-800">
            This strategy is typically most relevant for households with $250,000+ in retirement assets.
          </p>
        </div>
      )}

      {/* Variant-specific qualification message (step 8, variant 2) */}
      {currentStep === 7 && variant === 'rmd_v1_scarcity_late' && (
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
          Note: Most relevant for households with meaningful RMD tax exposure.
        </div>
      )}

      {/* Quiz Question */}
      <div className="mt-2">
        {currentQuestion.type === 'savings-slider' ? (
          <SavingsSlider
            question={currentQuestion}
            onAnswer={handleAnswer}
            currentAnswer={answers[currentQuestion.id]}
          />
        ) : currentQuestion.type === 'allocation-slider' ? (
          <AllocationSlider
            question={currentQuestion}
            onAnswer={handleAnswer}
            currentAnswer={answers[currentQuestion.id]}
            totalSavings={answers.total_savings}
          />
        ) : (
          <QuizQuestion
            question={currentQuestion}
            onAnswer={handleAnswer}
            currentAnswer={answers[currentQuestion.id]}
            funnelType="rmd-quiz"
            stepNumber={currentStep + 1}
            sessionId={getSessionId()}
            entryVariant={entryVariant} // Pass entry variant for tap target sizing
          />
        )}
      </div>

      {/* Back button (not on first step) */}
      {currentStep > 0 && (
        <div className="mt-6">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800 underline text-sm"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
};

