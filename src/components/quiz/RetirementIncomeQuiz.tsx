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
  const [showProcessing, setShowProcessing] = useState(false);
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);
  const [utmParams, setUtmParams] = useState<UTMParameters | null>(null);

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
      // Calculate score and redirect to appropriate results page
      const score = calculateScore(updatedAnswers);
      const resultsPath = getResultsPath(score);
      
      // Store answers and score in sessionStorage
      const quizData = {
        answers: updatedAnswers,
        score: score,
        resultsPath: resultsPath,
        sessionId: quizSessionId
      };
      sessionStorage.setItem('retirement_income_quiz_data', JSON.stringify(quizData));
      
      // Track quiz completion
      try {
        const completionTime = Date.now() - ((window as any).quizStartTime || Date.now());
        trackQuizComplete('retirement-income', quizSessionId || 'unknown', 'retirement-income', completionTime);
        
        // Track score bracket
        if (score >= 7) {
          trackGA4Event('score_high', {
            test_name: 'retirement_income_quiz',
            score: score,
            page_path: '/retirement-income-quiz',
            event_category: 'quiz_scoring'
          });
        } else if (score >= 4) {
          trackGA4Event('score_mid', {
            test_name: 'retirement_income_quiz',
            score: score,
            page_path: '/retirement-income-quiz',
            event_category: 'quiz_scoring'
          });
        } else {
          trackGA4Event('score_low', {
            test_name: 'retirement_income_quiz',
            score: score,
            page_path: '/retirement-income-quiz',
            event_category: 'quiz_scoring'
          });
        }
      } catch {}
      
      setShowProcessing(true);
      
      // Small delay for processing state, then redirect
      setTimeout(() => {
        router.push(resultsPath);
      }, 1500);
      
      return;
    }

    // Move to next question
    setCurrentStep(currentStep + 1);
  };

  if (showProcessing) {
    return <ProcessingState message="Calculating your personalized results..." />;
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

