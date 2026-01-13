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
  LeadData
} from '@/lib/temp-tracking';
import { formatPhoneForGHL } from '@/utils/phone-utils';

interface QuizAnswer {
  [key: string]: any;
}

type FunnelType = 'primary' | 'secondary';

// Final Expense Quiz Questions - 11-Screen CRO-Optimized Model
// Based on FEX-Quiz.md CRO specification (one question per screen)

const FINAL_EXPENSE_QUIZ_QUESTIONS = [
  // Screen 1: Gatekeeper Question
  {
    id: 'decisionMaker',
    title: 'Are you making this decision for yourself or a loved one?',
    subtitle: 'Don\'t worry - all options continue. We just want to personalize your experience.',
    type: 'multiple-choice' as const,
    options: [
      'For myself (I\'m the decision maker)',
      'For a family member (I\'m helping someone)',
      'Just researching options'
    ],
    headline: 'Let\'s Find Your Perfect Coverage',
    subheadline: 'Answer a few quick questions to see your personalized rates (takes 60 seconds)',
  },
  
  // Screen 2: Coverage Amount
  {
    id: 'coverageAmount',
    title: 'What coverage amount works best for your budget?',
    subtitle: 'Average funeral costs: $7,000-$12,000',
    type: 'coverage-amount-buttons' as const,
    options: [
      { value: 5000, label: '$5,000', description: 'Basic coverage' },
      { value: 10000, label: '$10,000', description: 'Most popular', popular: true },
      { value: 20000, label: '$20,000', description: 'Complete coverage' },
      { value: null, label: 'Not sure yet', description: 'We\'ll help you decide' }
    ],
    headline: 'How Much Coverage Do You Need?',
    subheadline: 'Most people choose between $5,000-$20,000 to cover funeral and final expenses',
  },
  
  // Screen 3: Age
  {
    id: 'ageRange',
    title: 'What is your age?',
    subtitle: 'We offer coverage for ages 50-89',
    type: 'multiple-choice' as const,
    options: [
      '50-59 years old',
      '60-69 years old',
      '70-79 years old',
      '80+ years old'
    ],
    headline: 'Almost There!',
    subheadline: 'Your age helps us calculate accurate rates',
  },
  
  // Screen 4: Smoker Status
  {
    id: 'tobaccoUse',
    title: 'Do you currently use tobacco or nicotine products?',
    subtitle: 'Includes cigarettes, cigars, chewing tobacco, vaping, or nicotine patches used in the last 12 months',
    type: 'multiple-choice' as const,
    options: [
      'Non-smoker - I don\'t use tobacco/nicotine',
      'Smoker or tobacco user - I currently use tobacco/nicotine'
    ],
    headline: 'Your Health Matters',
    subheadline: 'Non-smokers typically qualify for lower rates',
  },
  
  // Screen 5: Health Question 1
  {
    id: 'healthQuestion1',
    title: 'Are you currently hospitalized, in a nursing home, or receiving hospice care?',
    subtitle: 'Answering "Yes" doesn\'t disqualify you - we have options for all situations',
    type: 'yes-no' as const,
    headline: 'Quick Health Questions',
    subheadline: 'These help us match you with the right policy (most people answer "No")',
  },
  
  // Screen 6: Health Question 2
  {
    id: 'healthQuestion2',
    title: 'Have you been diagnosed with a terminal illness expected to result in death within the next 12 months?',
    subtitle: 'Your honesty helps us find the best coverage for your situation',
    type: 'yes-no' as const,
    headline: 'Quick Health Questions',
    subheadline: 'Question 2 of 3',
  },
  
  // Screen 7: Health Question 3
  {
    id: 'healthQuestion3',
    title: 'In the past 2 years, have you had a heart attack, stroke, or been diagnosed with cancer?',
    subtitle: 'Excludes basal or squamous cell skin cancer',
    type: 'yes-no' as const,
    headline: 'Quick Health Questions',
    subheadline: 'Last health question!',
  },
  
  // Screen 8: Address
  {
    id: 'addressInfo',
    title: 'What\'s your address?',
    subtitle: 'We only operate in [your service states]. Don\'t worry - we never share your information.',
    type: 'address-info' as const,
    headline: 'Where Should We Send Your Quote?',
    subheadline: 'We\'ll email your personalized rates instantly',
  },
  
  // Screen 9: Date of Birth
  {
    id: 'dateOfBirth',
    title: 'What\'s your date of birth?',
    subtitle: 'We need your exact date of birth to generate accurate quotes',
    type: 'date-of-birth-dropdowns' as const,
    headline: 'Almost There!',
    subheadline: 'This helps us find you the absolute best rates',
    minYear: 1935, // Age 91
    maxYear: 1976, // Age 50
  },
  
  // Screen 10: Final Combined Form (Name, Email, Phone, TCPA)
  // Uses existing personal-info-with-benefits protocol (same as quiz-b)
  {
    id: 'personalInfoFinal',
    title: 'Final Step: Complete Your Information',
    subtitle: 'We\'ll use this to send you personalized quotes and connect you with a licensed agent',
    type: 'personal-info-with-benefits' as const,
    benefits: [
      'Free confidential consultation with a licensed agent',
      'Personalized final expense insurance quotes',
      'Help finding coverage that fits your budget and needs'
    ],
    headline: 'Last Step - Complete Your Information',
    subheadline: 'A licensed agent will call you with your personalized rates',
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

  const questions = FINAL_EXPENSE_QUIZ_QUESTIONS;
  const totalSteps = questions.length;

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

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
    
    try {
      trackQuestionAnswer(currentQuestion.id, answer, currentStep + 1, questions.length, quizSessionId || 'unknown', 'final-expense-quote');
    } catch {}
    
    const updatedAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(updatedAnswers);

    // Handle final submission on personalInfoFinal (Screen 10 - last question)
    // Uses same protocol as quiz-b: combined name, email, phone with TCPA (implied consent)
    if (currentQuestion.id === 'personalInfoFinal') {
      console.log('📝 Final Submission (Screen 10 - Personal Info):', {
        firstName: answer.firstName,
        lastName: answer.lastName,
        email: answer.email,
        phone: answer.phone,
        dateOfBirth: updatedAnswers.dateOfBirth,
        decisionMaker: updatedAnswers.decisionMaker,
        coverageAmount: updatedAnswers.coverageAmount,
        ageRange: updatedAnswers.ageRange,
        tobaccoUse: updatedAnswers.tobaccoUse,
        healthQuestions: {
          healthQuestion1: updatedAnswers.healthQuestion1,
          healthQuestion2: updatedAnswers.healthQuestion2,
          healthQuestion3: updatedAnswers.healthQuestion3,
        },
        sessionId: getSessionId()
      });
      
      setShowProcessing(true);
      
      try {
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
            dateOfBirth: updatedAnswers.dateOfBirth, // Format: { month, day, year, dateString, iso }
            decisionMaker: updatedAnswers.decisionMaker,
            coverageAmount: updatedAnswers.coverageAmount,
            ageRange: updatedAnswers.ageRange,
            tobaccoUse: updatedAnswers.tobaccoUse,
            healthQuestion1: updatedAnswers.healthQuestion1,
            healthQuestion2: updatedAnswers.healthQuestion2,
            healthQuestion3: updatedAnswers.healthQuestion3,
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
        
        // Store answers and navigate to results page
        const answersJson = JSON.stringify(updatedAnswers);
        sessionStorage.setItem('quiz_answers', answersJson);
        localStorage.setItem('quiz_answers', answersJson);
        
        setShowProcessing(false);
        console.log('✅ Navigating to results page');
        router.push('/final-expense-quote/results');
      } catch (error) {
        console.error('💥 Form submission error:', error);
        
        // Store answers even on error and navigate to results page
        const answersJson = JSON.stringify(updatedAnswers);
        sessionStorage.setItem('quiz_answers', answersJson);
        localStorage.setItem('quiz_answers', answersJson);
        
        setShowProcessing(false);
        console.log('✅ Navigating to results page (error case)');
        router.push('/final-expense-quote/results');
      }
      return;
    }

    if (currentStep === questions.length - 1) {
      // Store answers and navigate to results page
      const answersJson = JSON.stringify(updatedAnswers);
      sessionStorage.setItem('quiz_answers', answersJson);
      localStorage.setItem('quiz_answers', answersJson);
      calculateResults();
      router.push('/final-expense-quote/results');
    } else {
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
    setShowOTP(false);
    setShowProcessing(false);
    setQuizSessionId(null);
  };

  if (showProcessing) {
    return <ProcessingState message="Processing your information..." />;
  }

  if (showOTP) {
    const phoneNumber = answers.phoneNumber || '';
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
          router.push('/final-expense-quote/results');
        }}
        onBack={() => setShowOTP(false)}
      />
    );
  }

  const currentQuestion = questions[currentStep];
  const progressPercentage = Math.round(((currentStep + 1) / totalSteps) * 100);
  const progressBar = '━'.repeat(currentStep + 1) + '○'.repeat(totalSteps - currentStep - 1);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">
            {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm font-semibold text-gray-600">
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#36596A] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500 font-mono">{progressBar}</span>
        </div>
      </div>

      {/* Page Headline & Subheadline */}
      {currentQuestion.headline && (
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {currentQuestion.headline}
          </h1>
          {currentQuestion.subheadline && (
            <p className="text-lg text-gray-600">
              {currentQuestion.subheadline}
            </p>
          )}
        </div>
      )}

      {/* Question Content */}
      <div className="mt-2">
        <QuizQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          currentAnswer={answers[currentQuestion.id]}
          isLoading={showProcessing}
        />
      </div>

      {/* Trust Badge (on first screen) */}
      {currentStep === 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            🔒 Your information is private and secure
          </p>
        </div>
      )}
    </div>
  );
};

