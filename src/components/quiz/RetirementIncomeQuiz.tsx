'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { ProcessingState } from './ProcessingState';
import { extractUTMParameters, storeUTMParameters, getStoredUTMParameters, hasUTMParameters, UTMParameters } from '@/utils/utm-utils';
import { trackUTMParameters } from '@/utils/utm-tracker';
import { 
  initializeTracking, 
  trackQuestionAnswer, 
  trackPageView, 
  trackQuizStart, 
  trackQuizComplete,
  sendCAPIViewContentEventMultiSite,
  trackGA4Event
} from '@/lib/temp-tracking';
import { formatPhoneForGHL, extractUSPhoneNumber, formatPhoneForInput } from '@/utils/phone-utils';
import { getPhoneValidationState, validatePhoneFormat } from '@/utils/phone-validation';
import { getEmailValidationState, validateEmailFormat } from '@/utils/email-validation';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { getTrustedFormCertUrl } from '@/components/tracking/TrustedForm';

interface QuizAnswer {
  [key: string]: any;
}

// Retirement Income Quiz Questions
const RETIREMENT_INCOME_QUIZ_QUESTIONS = [
  {
    id: 'retirementSavings',
    title: 'Do you currently have more than $500,000 saved for retirement?',
    subtitle: 'This helps us understand your retirement readiness',
    type: 'multiple-choice' as const,
    options: ['Yes', 'No'],
  },
  {
    id: 'takingIncome',
    title: 'Are you currently taking income from your retirement accounts?',
    subtitle: 'This helps us understand your current income strategy',
    type: 'multiple-choice' as const,
    options: ['Yes', 'No'],
  },
  {
    id: 'confidenceLevel',
    title: 'How confident are you that your savings will last into your 90s?',
    subtitle: 'Select the option that best describes your confidence level',
    type: 'multiple-choice' as const,
    options: [
      'Not confident at all',
      'Somewhat unconfident',
      'Neutral',
      'Somewhat confident',
      'Very confident'
    ],
  },
  {
    id: 'inflationPlanning',
    title: 'Have you planned for how inflation may reduce your purchasing power over time?',
    subtitle: 'This helps us understand your inflation awareness',
    type: 'multiple-choice' as const,
    options: ['Yes', 'No', 'Not sure'],
  },
  {
    id: 'rmdUnderstanding',
    title: 'Do you understand how Required Minimum Distributions (RMDs) could affect your taxes?',
    subtitle: 'This helps us understand your tax planning awareness',
    type: 'multiple-choice' as const,
    options: ['Yes', 'No'],
  },
  {
    id: 'marketDropPlan',
    title: 'If markets dropped 25% next year, do you have a plan to generate income without selling at a loss?',
    subtitle: 'This helps us understand your risk management strategy',
    type: 'multiple-choice' as const,
    options: ['Yes', 'No', 'Not sure'],
  },
  {
    id: 'guaranteedIncomeFeeling',
    title: 'Imagine having a monthly retirement paycheck that is tax‑efficient, inflation‑aware, and not dependent on market performance. How would that feel?',
    subtitle: 'This helps us understand your emotional response to guaranteed income',
    type: 'multiple-choice' as const,
    options: ['Relieved', 'Interested', 'Skeptical', 'Indifferent'],
  },
  {
    id: 'taxReductionAction',
    title: 'If you could reduce taxes and protect your income, would you take action this year?',
    subtitle: 'This helps us understand your readiness to take action',
    type: 'multiple-choice' as const,
    options: ['Yes', 'Maybe', 'No'],
  },
  {
    id: 'futureSelfVision',
    title: 'Picture your 75‑year‑old self feeling confident about money. What helped get you there?',
    subtitle: 'This helps us understand your vision for financial security',
    type: 'multiple-choice' as const,
    options: [
      'Smart income planning',
      'Market performance',
      'Cutting expenses',
      'Not sure'
    ],
  },
];

// Scoring logic based on YAML spec
const calculateScore = (answers: QuizAnswer): number => {
  let score = 0;

  // Question 1: retirementSavings
  if (answers.retirementSavings === 'Yes') score += 1;

  // Question 2: takingIncome
  if (answers.takingIncome === 'Yes') score += 1;

  // Question 3: confidenceLevel (1-5 scale mapped to 0-1)
  const confidenceMap: { [key: string]: number } = {
    'Not confident at all': 0,
    'Somewhat unconfident': 0,
    'Neutral': 1,
    'Somewhat confident': 1,
    'Very confident': 1,
  };
  if (answers.confidenceLevel && confidenceMap[answers.confidenceLevel] !== undefined) {
    score += confidenceMap[answers.confidenceLevel];
  }

  // Question 4: inflationPlanning
  if (answers.inflationPlanning === 'Yes') score += 1;

  // Question 5: rmdUnderstanding
  if (answers.rmdUnderstanding === 'Yes') score += 1;

  // Question 6: marketDropPlan
  if (answers.marketDropPlan === 'Yes') score += 1;

  // Question 7: guaranteedIncomeFeeling
  const feelingMap: { [key: string]: number } = {
    'Relieved': 1,
    'Interested': 1,
    'Skeptical': 0,
    'Indifferent': 0,
  };
  if (answers.guaranteedIncomeFeeling && feelingMap[answers.guaranteedIncomeFeeling] !== undefined) {
    score += feelingMap[answers.guaranteedIncomeFeeling];
  }

  // Question 8: taxReductionAction
  if (answers.taxReductionAction === 'Yes') score += 1;

  // Question 9: futureSelfVision
  if (answers.futureSelfVision === 'Smart income planning') score += 1;

  return score;
};

// Calculate percentile score (0-100) based on raw score (0-9)
const calculatePercentile = (rawScore: number): number => {
  // Convert raw score (0-9) to percentile (0-100)
  // Using a simple linear conversion: (score / 9) * 100
  return Math.round((rawScore / 9) * 100);
};

// Determine results page based on score
const getResultsPath = (score: number): string => {
  if (score >= 7) return '/quiz-results/high';
  if (score >= 4) return '/quiz-results/mid';
  return '/quiz-results/low';
};

interface RetirementIncomeQuizProps {
  onStepChange?: (step: number) => void;
}

export const RetirementIncomeQuiz = ({ onStepChange }: RetirementIncomeQuizProps) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>({});
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);
  const [utmParams, setUtmParams] = useState<UTMParameters | null>(null);
  
  // Lead capture form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailValidationState, setEmailValidationState] = useState<'empty' | 'invalid' | 'valid'>('empty');
  const [phoneValidationState, setPhoneValidationState] = useState<'empty' | 'invalid' | 'valid'>('empty');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const questions = RETIREMENT_INCOME_QUIZ_QUESTIONS;
  const totalSteps = questions.length;

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  useEffect(() => {
    const sessionId = `retirement_income_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setQuizSessionId(sessionId);
    
    initializeTracking();
    trackPageView('Retirement Income Quiz', '/retirement-income-quiz');
    trackQuizStart('retirement-income', sessionId);
    sendCAPIViewContentEventMultiSite({
      quizType: 'retirement-income',
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
      trackQuestionAnswer(currentQuestion.id, answer, currentStep + 1, questions.length, quizSessionId || 'unknown', 'retirement-income');
    } catch {}
    
    const updatedAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(updatedAnswers);

    // Check if this is the last question
    if (currentStep === questions.length - 1) {
      // Show lead capture form instead of going directly to results
      setShowLeadCapture(true);
      return;
    }

    // Move to next question
    setCurrentStep(currentStep + 1);
  };

  const handleLeadCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Capture TrustedForm certificate URL using helper function (more reliable)
    const trustedFormCertUrl = getTrustedFormCertUrl() || '';
    
    if (!firstName || !lastName || !email || !phone) return;
    if (emailValidationState !== 'valid' || phoneValidationState !== 'valid') return;
    
    setIsSubmittingLead(true);
    
    // Extract 10 digits from phone
    const digits = extractUSPhoneNumber(phone);
    if (digits.length !== 10) {
      setPhoneError('Please enter a valid 10-digit US phone number.');
      setIsSubmittingLead(false);
      return;
    }
    
    const formattedPhone = formatPhoneForGHL(digits);
    
    // Store lead data
    const leadData = {
      firstName,
      lastName,
      email,
      phone: formattedPhone,
      quizAnswers: answers,
      sessionId: quizSessionId
    };
    
    // Save to sessionStorage
    const rawScore = calculateScore(answers);
    const percentile = calculatePercentile(rawScore);
    const resultsPath = getResultsPath(rawScore);
    
    const quizData = {
      answers: answers,
      rawScore: rawScore,
      percentile: percentile,
      resultsPath: resultsPath,
      sessionId: quizSessionId,
      leadData: leadData
    };
    sessionStorage.setItem('retirement_income_quiz_data', JSON.stringify(quizData));
    
    // Track quiz completion
    try {
      const completionTime = Date.now() - ((window as any).quizStartTime || Date.now());
      trackQuizComplete('retirement-income', quizSessionId || 'unknown', 'retirement-income', completionTime);
      
      // Track score bracket
      if (rawScore >= 7) {
        trackGA4Event('score_high', {
          test_name: 'retirement_income_quiz',
          raw_score: rawScore,
          percentile: percentile,
          page_path: '/retirement-income-quiz',
          event_category: 'quiz_scoring'
        });
      } else if (rawScore >= 4) {
        trackGA4Event('score_mid', {
          test_name: 'retirement_income_quiz',
          raw_score: rawScore,
          percentile: percentile,
          page_path: '/retirement-income-quiz',
          event_category: 'quiz_scoring'
        });
      } else {
        trackGA4Event('score_low', {
          test_name: 'retirement_income_quiz',
          raw_score: rawScore,
          percentile: percentile,
          page_path: '/retirement-income-quiz',
          event_category: 'quiz_scoring'
        });
      }
    } catch {}
    
    setIsSubmittingLead(false);
    setShowLeadCapture(false);
    setShowProcessing(true);
    
    // Show anticipation screen for 3 seconds, then redirect
    setTimeout(() => {
      router.push(resultsPath);
    }, 3000);
  };

  if (showProcessing) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#36596A] mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-[#36596A] mb-4">
            Calculating Your Personalized Results...
          </h2>
          <p className="text-lg text-gray-600">
            We're analyzing your responses to create your custom retirement income assessment.
          </p>
        </div>
      </div>
    );
  }

  if (showLeadCapture) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#36596A] mb-4 text-center">
            Get Your Personalized Results
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Enter your information below to receive your custom retirement income assessment.
          </p>
          
          <form onSubmit={handleLeadCaptureSubmit} className="space-y-6">
            {/* TrustedForm hidden input */}
            <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" value="" />
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                required
                disabled={isSubmittingLead}
              />
            </div>
            
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                required
                disabled={isSubmittingLead}
              />
            </div>
            
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    setEmail(newEmail);
                    const state = getEmailValidationState(newEmail);
                    setEmailValidationState(state);
                    const validation = validateEmailFormat(newEmail);
                    setEmailError(validation.error || '');
                  }}
                  className={`
                    w-full px-4 py-3 pr-12 text-lg border-2 rounded-lg focus:ring-4 focus:ring-[#36596A]/20 transition-all
                    ${emailValidationState === 'empty' ? 'border-gray-300' : ''}
                    ${emailValidationState === 'invalid' ? 'border-red-500 bg-red-50 focus:border-red-500' : ''}
                    ${emailValidationState === 'valid' ? 'border-green-500 bg-green-50 focus:border-green-500' : ''}
                  `}
                  required
                  disabled={isSubmittingLead}
                />
                {emailValidationState === 'invalid' && email && (
                  <AlertTriangle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
                {emailValidationState === 'valid' && email && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {emailValidationState === 'invalid' && emailError && (
                <p className="text-red-600 text-sm mt-2">{emailError}</p>
              )}
            </div>
            
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <span className="text-gray-500 text-lg font-medium">+1</span>
                </div>
                <input
                  type="tel"
                  value={formatPhoneForInput(phone)}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const digits = inputValue.replace(/\D/g, '');
                    const limitedDigits = digits.slice(0, 10);
                    setPhone(limitedDigits);
                    const state = getPhoneValidationState(limitedDigits);
                    setPhoneValidationState(state);
                    const validation = validatePhoneFormat(limitedDigits);
                    setPhoneError(validation.error || '');
                  }}
                  className={`
                    w-full pr-12 py-3 text-lg border-2 rounded-lg focus:ring-4 focus:ring-[#36596A]/20 transition-all
                    ${phoneValidationState === 'empty' ? 'border-gray-300' : ''}
                    ${phoneValidationState === 'invalid' ? 'border-red-500 bg-red-50 focus:border-red-500' : ''}
                    ${phoneValidationState === 'valid' ? 'border-green-500 bg-green-50 focus:border-green-500' : ''}
                  `}
                  placeholder="(555) 123-4567"
                  required
                  disabled={isSubmittingLead}
                  style={{ paddingLeft: '60px' }}
                />
                {phoneValidationState === 'invalid' && phone && (
                  <AlertTriangle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
                {phoneValidationState === 'valid' && phone && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {phoneValidationState === 'invalid' && phoneError && (
                <p className="text-red-600 text-sm mt-2">{phoneError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#36596A] text-white py-4 px-8 rounded-lg font-bold text-xl hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !firstName ||
                !lastName ||
                !email ||
                !phone ||
                emailValidationState !== 'valid' ||
                phoneValidationState !== 'valid' ||
                isSubmittingLead
              }
            >
              {isSubmittingLead ? 'Submitting...' : 'Get My Results'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <QuizProgress currentStep={currentStep} totalSteps={totalSteps} />
      <div className="mt-2">
        <QuizQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          currentAnswer={answers[currentQuestion.id]}
          isLoading={showProcessing}
        />
      </div>
    </div>
  );
};
