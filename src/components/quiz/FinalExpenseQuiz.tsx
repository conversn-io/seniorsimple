'use client'

// Final Expense Life Insurance Quiz Component
// Based on AnnuityQuoteQuiz structure but tailored for final expense insurance

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { OTPVerification } from './OTPVerification';
import { ProcessingState } from './ProcessingState';
import { extractUTMParameters, storeUTMParameters, getStoredUTMParameters, hasUTMParameters, UTMParameters } from '@/utils/utm-utils';
import { trackUTMParameters } from '@/utils/utm-tracker';
import { 
  initializeTracking, 
  trackQuestionAnswer, 
  trackLeadFormSubmit, 
  trackPageView, 
  trackQuizStart, 
  trackQuizComplete,
  sendCAPILeadEventMultiSite,
  sendCAPIViewContentEventMultiSite,
  trackQuizStepViewed,
  LeadData
} from '@/lib/temp-tracking';
import { formatPhoneForGHL } from '@/utils/phone-utils';

interface QuizAnswer {
  [key: string]: any;
}

type FunnelType = 'primary' | 'secondary';

// Final Expense Quiz Questions - CRO-Optimized 5-Step Model
// P0: Maximize conversion rate while meeting buyer-required fields
// Removed: intent question, full address, DOB, non-required health questions

const FINAL_EXPENSE_QUIZ_QUESTIONS = [
  // Step 1: Age Range
  {
    id: 'ageRange',
    title: 'What is your age range?',
    subtitle: 'We offer coverage for ages 50–89.',
    type: 'multiple-choice' as const,
    options: [
      '50–59',
      '60–69',
      '70–79',
      '80+'
    ],
  },
  
  // Step 2: Coverage Amount
  {
    id: 'coverageAmount',
    title: 'What coverage amount fits your budget?',
    subtitle: 'Average funeral costs: $7,000–$12,000.',
    type: 'coverage-amount-buttons' as const,
    options: [
      { value: 5000, label: '$5,000', description: 'Basic coverage' },
      { value: 10000, label: '$10,000', description: 'Most popular', popular: true },
      { value: 20000, label: '$20,000', description: 'Complete coverage' },
      { value: null, label: 'Not sure yet', description: 'We\'ll help you decide' }
    ],
  },
  
  // Step 3: ZIP Code Only (no address autocomplete)
  {
    id: 'zipCode',
    title: 'What is your ZIP code?',
    subtitle: 'Rates can vary by area.',
    type: 'zip-only' as const,
    placeholder: 'Enter 5-digit ZIP',
    maxlength: 5,
  },
  
  // Step 4: Smoker Status (past 12 months) - Required
  {
    id: 'tobaccoUse',
    title: 'Tobacco / nicotine use',
    subtitle: 'This helps us match you with the right options.',
    prompt: 'Have you used tobacco or nicotine in the past 12 months?',
    microcopy: 'Includes cigarettes, cigars, chewing tobacco, vaping, or nicotine pouches.',
    type: 'multiple-choice' as const,
    options: [
      'No',
      'Yes'
    ],
  },
  
  // Step 5: Beneficiary Relationship Only
  {
    id: 'beneficiaryRelationship',
    title: 'Who is the beneficiary?',
    subtitle: 'This helps us personalize your options.',
    type: 'multiple-choice' as const,
    options: [
      'Spouse',
      'Child',
      'Grandchild',
      'Other family member',
      'Friend',
      'Trust / Estate',
      'Charity',
      'Not sure yet'
    ],
  },
  
  // Step 6: Contact Form (dedicated page)
  {
    id: 'personalInfo',
    title: 'Where should we send your options?',
    subtitle: 'A licensed agent will call you shortly.',
    type: 'personal-info-with-benefits' as const,
    benefits: [
      'A quick call from a licensed final expense agent',
      'Personalized options based on your answers',
      'Help choosing coverage that fits your budget'
    ],
  },
];

interface FinalExpenseQuizProps {
  skipOTP?: boolean;
  onStepChange?: (step: number) => void;
}

export const FinalExpenseQuiz = ({ skipOTP = false, onStepChange }: FinalExpenseQuizProps) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>({});
  const [funnelType, setFunnelType] = useState<FunnelType>('primary');
  const [showResults, setShowResults] = useState(false);
  // OTP disabled - no blocking flow
  const [showProcessing, setShowProcessing] = useState(false);
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);
  const [utmParams, setUtmParams] = useState<UTMParameters | null>(null);
  const [previousStep, setPreviousStep] = useState<string | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const [previousStepTime, setPreviousStepTime] = useState<number>(0);

  const getSessionId = (): string => {
    if (typeof window !== 'undefined') {
      const sessionId = sessionStorage.getItem('session_id');
      if (sessionId) {
        return sessionId;
      }
    }
    return quizSessionId || 'unknown';
  };

  const questions = FINAL_EXPENSE_QUIZ_QUESTIONS;
  const totalSteps = questions.length;

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  // Track step view when currentStep changes
  useEffect(() => {
    if (currentStep >= 0 && currentStep < questions.length && quizSessionId) {
      const currentQuestion = questions[currentStep];
      const timeOnPrevious = previousStepTime > 0 ? Math.round((Date.now() - stepStartTime) / 1000) : null;
      
      trackQuizStepViewed({
        stepNumber: currentStep + 1,
        stepName: currentQuestion.id,
        funnelType: 'final-expense-quote',
        previousStep: previousStep,
        timeOnPreviousStep: timeOnPrevious,
        sessionId: getSessionId()
      });

      // Update tracking state
      setPreviousStep(currentQuestion.id);
      setStepStartTime(Date.now());
      setPreviousStepTime(timeOnPrevious || 0);
    }
  }, [currentStep, quizSessionId]);

  useEffect(() => {
    const sessionId = `final_expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setQuizSessionId(sessionId);
    
    initializeTracking();
    trackPageView('SeniorSimple Final Expense Quote Quiz', '/final-expense-quote');
    trackQuizStart('final-expense-quote', sessionId);
    sendCAPIViewContentEventMultiSite({
      quizType: 'final-expense-quote',
      sessionId: sessionId
    });

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
        const trackingSuccess = await trackUTMParameters(sessionId, utmData);
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
  }, []);

  const handleAnswer = async (answer: any) => {
    const currentQuestion = questions[currentStep];
    
    // Track step view and completion events
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        const stepEventName = `fe_step_view_${currentQuestion.id}`;
        window.gtag('event', stepEventName, {
          step_number: currentStep + 1,
          total_steps: questions.length,
          session_id: getSessionId(),
          funnel_type: 'final-expense-quote'
        });
      }
    } catch {}
    
    try {
      trackQuestionAnswer(currentQuestion.id, answer, currentStep + 1, questions.length, quizSessionId || 'unknown', 'final-expense-quote');
    } catch {}
    
    // Track step completion
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        const stepCompleteEventName = `fe_step_complete_${currentQuestion.id}`;
        window.gtag('event', stepCompleteEventName, {
          step_number: currentStep + 1,
          total_steps: questions.length,
          session_id: getSessionId(),
          funnel_type: 'final-expense-quote',
          answer: typeof answer === 'object' ? JSON.stringify(answer) : answer
        });
      }
    } catch {}
    
    const updatedAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(updatedAnswers);

    // Handle beneficiary relationship selection (Step 5) - just move to next step
    if (currentQuestion.id === 'beneficiaryRelationship') {
      // Move to contact form page (Step 6)
      setCurrentStep(currentStep + 1);
      return;
    }

    // Handle final submission on personalInfo (Step 6 - contact form)
    // No OTP blocking - submit directly
    if (currentQuestion.id === 'personalInfo') {
      console.log('📝 Final Submission (Step 6 - Contact Form):', {
        beneficiaryRelationship: updatedAnswers.beneficiaryRelationship,
        firstName: answer.firstName,
        lastName: answer.lastName,
        email: answer.email,
        phone: answer.phone,
        zipCode: updatedAnswers.zipCode,
        coverageAmount: updatedAnswers.coverageAmount,
        ageRange: updatedAnswers.ageRange,
        tobaccoUse: updatedAnswers.tobaccoUse,
        sessionId: getSessionId()
      });
      
      setShowProcessing(true);
      
      try {
        // Track lead form submit
        trackLeadFormSubmit({
          firstName: answer.firstName,
          lastName: answer.lastName,
          email: answer.email,
          phoneNumber: answer.phone,
          sessionId: getSessionId(),
          funnelType: 'final-expense-quote',
          leadScore: 75,
          age: updatedAnswers.ageRange,
          zipCode: updatedAnswers.zipCode || '',
          quizAnswers: updatedAnswers,
          // state not collected (ZIP only)
        });

        // Fire Meta Lead event
        try {
          if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'Lead', {
              content_name: 'Final Expense Quote',
              content_category: 'lead_generation',
              value: 75,
              currency: 'USD',
              age_range: updatedAnswers.ageRange,
              coverage_amount: updatedAnswers.coverageAmount,
              tobacco_use: updatedAnswers.tobaccoUse,
              beneficiary_relationship: updatedAnswers.beneficiaryRelationship,
              zip_code: updatedAnswers.zipCode
            });
          }
        } catch {}

        const response = await fetch('/api/leads/submit-without-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: answer.email,
            phoneNumber: answer.phone,
            firstName: answer.firstName,
            lastName: answer.lastName,
            quizAnswers: updatedAnswers,
            calculatedResults: calculateResults(),
            zipCode: updatedAnswers.zipCode, // ZIP only, no address
            coverageAmount: updatedAnswers.coverageAmount,
            ageRange: updatedAnswers.ageRange,
            tobaccoUse: updatedAnswers.tobaccoUse,
            beneficiaryRelationship: updatedAnswers.beneficiaryRelationship,
            utmParams: utmParams,
            sessionId: getSessionId(),
            funnelType: 'final-expense-quote'
          })
        });

        console.log('📡 API Response Status:', response.status);
        
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          const text = await response.text();
          console.error('❌ Failed to parse response:', text);
          result = { success: false, error: 'Invalid response from server' };
        }
        
        console.log('📡 API Response:', result);
        
        // Track lead created event
        try {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'lead_created', {
              session_id: getSessionId(),
              funnel_type: 'final-expense-quote',
              lead_score: 75
            });
          }
        } catch {}
        
        // Store answers and navigate to thank you page
        const answersJson = JSON.stringify(updatedAnswers);
        sessionStorage.setItem('quiz_answers', answersJson);
        localStorage.setItem('quiz_answers', answersJson);
        
        setShowProcessing(false);
        console.log('✅ Navigating to thank you page');
        router.push('/final-expense-quote/thank-you');
      } catch (error) {
        console.error('💥 Form submission error:', error);
        
        // Store answers even on error and navigate to thank you page
        const answersJson = JSON.stringify(updatedAnswers);
        sessionStorage.setItem('quiz_answers', answersJson);
        localStorage.setItem('quiz_answers', answersJson);
        
        setShowProcessing(false);
        console.log('✅ Navigating to thank you page (error case)');
        router.push('/final-expense-quote/thank-you');
      }
      return;
    }

    // Advance to next step
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const calculateResults = () => {
    try {
      const completionTime = Date.now() - ((window as any).quizStartTime || Date.now());
      trackQuizComplete('final-expense-quote', quizSessionId || 'unknown', 'final-expense-quote', completionTime);
    } catch {}

    return {
      leadScore: 75
    };
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setFunnelType('primary');
    setShowResults(false);
    setShowProcessing(false);
    setQuizSessionId(null);
  };

  if (showProcessing) {
    return <ProcessingState message="Processing your information..." />;
  }

  // OTP is disabled - no blocking flow
  // OTP can be sent post-submit if needed for high-risk leads only

  const currentQuestion = questions[currentStep];
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Indicator - Matches CRO standard */}
      <QuizProgress currentStep={currentStep} totalSteps={totalSteps} />

      {/* Question Content */}
      <div className="mt-2">
        <QuizQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          currentAnswer={answers[currentQuestion.id]}
          isLoading={showProcessing}
        />
        
        {/* Mini CTA / Preview text for first question - Matches CRO standard */}
        {currentStep === 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              <strong>Next:</strong> Coverage amount & eligibility
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

