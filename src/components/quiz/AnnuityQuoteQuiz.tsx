'use client'

// This is a simplified version of AnnuityQuiz for the annuity quote funnel
// Key differences:
// 1. Uses address-info instead of location-info
// 2. Uses personal-info-with-benefits instead of personal-info
// 3. Shows AgentAssignmentPage instead of redirecting
// 4. Updates GHL payload with IP, phone last 4, coverage_amount, and address fields

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { SavingsSlider } from './SavingsSlider';
import { AllocationSlider } from './AllocationSlider';
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
  LeadData
} from '@/lib/temp-tracking';
import { formatPhoneForGHL } from '@/utils/phone-utils';

interface QuizAnswer {
  [key: string]: any;
}

type FunnelType = 'primary' | 'secondary';

// Same questions as AnnuityQuiz but with address-info and personal-info-with-benefits
const PRIMARY_QUIZ_QUESTIONS = [
  {
    id: 'ageRange',
    title: 'How old are you?',
    subtitle: 'We use your age to determine eligibility for key retirement protections.',
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
    id: 'retirementTimeline',
    title: 'How soon are you planning to retire?',
    subtitle: 'This helps us recommend the right investment strategy',
    type: 'multiple-choice' as const,
    options: [
      'Already retired',
      'Within 1-2 years',
      '3-5 years',
      '6-10 years',
      'More than 10 years'
    ],
  },
  {
    id: 'riskTolerance',
    title: 'How would you describe your risk tolerance?',
    subtitle: 'This helps us recommend appropriate investment strategies',
    type: 'multiple-choice' as const,
    options: [
      'Conservative - I want to protect my principal',
      'Moderate - I want some growth with some protection',
      'Aggressive - I want maximum growth potential'
    ],
  },
  {
    id: 'currentRetirementPlans',
    title: 'What type of retirement accounts do you currently have?',
    subtitle: 'Select all that apply to your current situation',
    type: 'multi-select' as const,
    options: [
      '401(k) or 403(b)',
      'IRA (Traditional or Roth)',
      'Pension',
      'Annuities',
      'Taxable investments',
      'None of the above'
    ],
  },
  {
    id: 'retirementSavings',
    title: 'What is your total retirement savings?',
    subtitle: 'Use the slider to select your total retirement savings across all accounts',
    type: 'savings-slider' as const,
    min: 50000,
    max: 2000000,
    step: 50000,
    defaultValue: 250000,
    unit: '$',
  },
  {
    id: 'allocationPercent',
    title: 'How much of your retirement savings would you like to protect from market volatility?',
    subtitle: 'Use the slider to select your preferred allocation amount',
    type: 'allocation-slider' as const,
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 25,
    unit: '%',
    showValue: true,
    conditional: true,
  },
  {
    id: 'addressInfo',
    title: 'Get connected to an advisor in your area',
    subtitle: 'Enter your address to find licensed professionals near you',
    type: 'address-info' as const,
  },
  {
    id: 'personalInfo',
    title: 'Let\'s get your contact information',
    subtitle: 'We\'ll use this to send you personalized recommendations',
    type: 'personal-info-with-benefits' as const,
  },
];

interface AnnuityQuoteQuizProps {
  skipOTP?: boolean;
  onStepChange?: (step: number) => void;
}

export const AnnuityQuoteQuiz = ({ skipOTP = false, onStepChange }: AnnuityQuoteQuizProps) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>({});
  const [funnelType, setFunnelType] = useState<FunnelType>('primary');
  const [showResults, setShowResults] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);
  const [utmParams, setUtmParams] = useState<UTMParameters | null>(null);

  const getSessionId = (): string => {
    if (typeof window !== 'undefined') {
      const sessionId = sessionStorage.getItem('session_id');
      if (sessionId) {
        return sessionId;
      }
    }
    return quizSessionId || 'unknown';
  };

  const getFilteredQuestions = () => {
    const baseQuestions = PRIMARY_QUIZ_QUESTIONS;
    if (answers.retirementSavings && answers.retirementSavings < 100000) {
      return baseQuestions.filter(q => q.id !== 'allocationPercent');
    }
    return baseQuestions;
  };

  const questions = getFilteredQuestions();
  const totalSteps = questions.length;

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  useEffect(() => {
    const sessionId = `annuity_quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setQuizSessionId(sessionId);
    
    initializeTracking();
    trackPageView('SeniorSimple Annuity Quote Quiz', '/annuity-quote');
    trackQuizStart('annuity-quote', sessionId);
    sendCAPIViewContentEventMultiSite({
      quizType: 'annuity-quote',
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
    
    try {
      trackQuestionAnswer(currentQuestion.id, answer, currentStep + 1, questions.length, quizSessionId || 'unknown', 'annuity-quote');
    } catch {}
    
    const updatedAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(updatedAnswers);

    if (currentQuestion.id === 'personalInfo') {
      console.log('📝 Personal Info Submitted:', {
        email: answer.email,
        phone: answer.phone,
        firstName: answer.firstName,
        lastName: answer.lastName,
        sessionId: getSessionId()
      });
      
      setShowProcessing(true);
      
      try {
        // Capture TrustedForm certificate URL from hidden input
        const trustedFormCertUrl = typeof document !== 'undefined' 
          ? (document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement)?.value || ''
          : '';

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
            addressInfo: updatedAnswers.addressInfo,
            utmParams: utmParams,
            sessionId: getSessionId(),
            funnelType: 'annuity-quote',
            trustedFormCertUrl: trustedFormCertUrl || null // TrustedForm certificate URL
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
        
        // Store answers and navigate to results page
        const answersJson = JSON.stringify(updatedAnswers);
        sessionStorage.setItem('quiz_answers', answersJson);
        localStorage.setItem('quiz_answers', answersJson);
        
        setShowProcessing(false);
        console.log('✅ Navigating to results page');
        router.push('/annuity-quote/results');
      } catch (error) {
        console.error('💥 Form submission error:', error);
        
        // Store answers even on error and navigate to results page
        const answersJson = JSON.stringify(updatedAnswers);
        sessionStorage.setItem('quiz_answers', answersJson);
        localStorage.setItem('quiz_answers', answersJson);
        
        setShowProcessing(false);
        console.log('✅ Navigating to results page (error case)');
        router.push('/annuity-quote/results');
      }
      return;
    }

    if (currentStep === questions.length - 1) {
      // Store answers and navigate to results page
      const answersJson = JSON.stringify(updatedAnswers);
      sessionStorage.setItem('quiz_answers', answersJson);
      localStorage.setItem('quiz_answers', answersJson);
      calculateResults();
      router.push('/annuity-quote/results');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const calculateResults = () => {
    try {
      const completionTime = Date.now() - ((window as any).quizStartTime || Date.now());
      trackQuizComplete('annuity-quote', quizSessionId || 'unknown', 'annuity-quote', completionTime);
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
    setShowOTP(false);
    setShowProcessing(false);
    setQuizSessionId(null);
  };

  if (showProcessing) {
    return <ProcessingState message="Processing your information..." />;
  }

  if (showOTP) {
    const phoneNumber = answers.personalInfo?.phone || '';
    if (!phoneNumber) {
      setShowOTP(false);
      return null;
    }
    return (
      <OTPVerification
        phoneNumber={phoneNumber}
        onVerificationComplete={() => {
          // Store answers and navigate to results page
          const answersJson = JSON.stringify(answers);
          sessionStorage.setItem('quiz_answers', answersJson);
          localStorage.setItem('quiz_answers', answersJson);
          setShowOTP(false);
          router.push('/annuity-quote/results');
        }}
        onBack={() => setShowOTP(false)}
      />
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <QuizProgress currentStep={currentStep} totalSteps={totalSteps} />
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
            totalSavings={answers.retirementSavings}
          />
        ) : (
          <QuizQuestion
            question={currentQuestion}
            onAnswer={handleAnswer}
            currentAnswer={answers[currentQuestion.id]}
            isLoading={showProcessing}
          />
        )}
      </div>
    </div>
  );
};

