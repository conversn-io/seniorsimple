'use client'

import { useState, useEffect } from 'react';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import { AgentAssignmentPage } from './AgentAssignmentPage';
import { SavingsSlider } from './SavingsSlider';
import { AllocationSlider } from './AllocationSlider';
import { useRouter } from 'next/navigation';
import { OTPVerification } from './OTPVerification';
import { ProcessingState } from './ProcessingState';
import { supabase } from '@/lib/supabase';
import { buildApiUrl } from '@/lib/api-config';
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

interface QuizAnswer {
  [key: string]: any;
}

type FunnelType = 'primary' | 'secondary';

// Primary funnel for investors with assets
const PRIMARY_QUIZ_QUESTIONS = [
  {
    id: 'ageRange',
    title: 'What is your current age range?',
    subtitle: 'This helps us recommend the right strategy for your timeline',
    type: 'multiple-choice' as const,
    options: [
      '50 or Younger',
      '51 - 60',
      '61 - 70',
      '70+'
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
    conditional: true, // Only show if savings >= $100k
  },
  {
    id: 'personalInfo',
    title: 'Let\'s get your contact information',
    subtitle: 'We\'ll use this to send you personalized recommendations',
    type: 'personal-info' as const,
  },
  {
    id: 'locationInfo',
    title: 'What\'s your ZIP code?',
    subtitle: 'This helps us provide state-specific guidance and connect you with licensed professionals in your area',
    type: 'location-info' as const,
  },
  {
    id: 'phone',
    title: 'What\'s your phone number?',
    subtitle: 'We\'ll send you a verification code to confirm your number',
    type: 'phone-consent' as const,
  },
];

// Secondary funnel for those with less assets
const SECONDARY_QUIZ_QUESTIONS = [
  {
    id: 'ageRange',
    title: 'What is your current age range?',
    subtitle: 'This helps us recommend the right strategy for your timeline',
    type: 'multiple-choice' as const,
    options: [
      '50 or Younger',
      '51 - 60',
      '61 - 70',
      '70+'
    ],
  },
  {
    id: 'retirementTimeline',
    title: 'How soon are you planning to retire?',
    subtitle: 'This helps us recommend the right savings strategy',
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
    subtitle: 'This helps us recommend appropriate savings strategies',
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
    defaultValue: 75000,
    unit: '$',
  },
  {
    id: 'personalInfo',
    title: 'Let\'s get your contact information',
    subtitle: 'We\'ll use this to send you personalized recommendations',
    type: 'personal-info' as const,
  },
  {
    id: 'locationInfo',
    title: 'What\'s your ZIP code?',
    subtitle: 'This helps us provide state-specific guidance and connect you with licensed professionals in your area',
    type: 'location-info' as const,
  },
  {
    id: 'phone',
    title: 'What\'s your phone number?',
    subtitle: 'We\'ll send you a verification code to confirm your number',
    type: 'phone-consent' as const,
  },
];

export const AnnuityQuiz = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>({});
  const [funnelType, setFunnelType] = useState<FunnelType>('primary');
  const [showResults, setShowResults] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);
  const [utmParams, setUtmParams] = useState<UTMParameters | null>(null);

  // Filter questions based on conditional logic
  const getFilteredQuestions = () => {
    const baseQuestions = funnelType === 'primary' ? PRIMARY_QUIZ_QUESTIONS : SECONDARY_QUIZ_QUESTIONS;
    
    // Skip allocation slider if savings < $100k
    if (answers.retirementSavings && answers.retirementSavings < 100000) {
      return baseQuestions.filter(q => q.id !== 'allocationPercent');
    }
    
    return baseQuestions;
  };

  const questions = getFilteredQuestions();
  const totalSteps = questions.length;

  useEffect(() => {
    // Generate unique session ID for tracking
    const sessionId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setQuizSessionId(sessionId);
    
    // Initialize comprehensive tracking
    initializeTracking();
    
    // Track page view
    trackPageView('SeniorSimple Retirement Quiz', '/quiz');
    
    // Track quiz start
    trackQuizStart('annuity', sessionId);
    
    // Send CAPI ViewContent event (multi-site)
    sendCAPIViewContentEventMultiSite({
      quizType: 'annuity',
      sessionId: sessionId
    });
    
    console.log('🚀 Quiz Session Started:', { 
      sessionId,
      funnelType, 
      totalSteps,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // UTM Tracking - Extract and track UTM parameters (following your proven pattern)
    const extractAndTrackUTM = async () => {
      // Check if we've already tracked UTM for this session
      const utmTracked = sessionStorage.getItem('utm_tracked');
      if (utmTracked === 'true') {
        console.log('📊 UTM Already Tracked for This Session');
        const storedUtm = getStoredUTMParameters();
        if (storedUtm) {
          setUtmParams(storedUtm);
        }
        return;
      }

      // Extract UTM parameters from URL
      const utmData = extractUTMParameters();
      
      if (hasUTMParameters(utmData)) {
        console.log('📊 UTM Parameters Found:', utmData);
        setUtmParams(utmData);
        storeUTMParameters(utmData);
        
        // Track UTM parameters using existing track-utm function
        const trackingSuccess = await trackUTMParameters(sessionId, utmData);
        
        if (trackingSuccess) {
          // Mark as tracked to prevent duplicate sends
          sessionStorage.setItem('utm_tracked', 'true');
          console.log('✅ UTM Parameters Tracked Successfully');
        } else {
          console.error('❌ UTM Tracking Failed');
        }
      } else {
        console.log('📊 No UTM Parameters Found in URL');
        // Check for stored UTM parameters from previous session
        const storedUtm = getStoredUTMParameters();
        if (storedUtm) {
          setUtmParams(storedUtm);
          console.log('📊 Using Stored UTM Parameters:', storedUtm);
        }
      }
    };

    extractAndTrackUTM();
  }, [funnelType, totalSteps]);

  const handleAnswer = async (answer: any) => {
    const currentQuestion = questions[currentStep];
    
    // Track question answer
    try {
      trackQuestionAnswer(currentQuestion.id, answer, currentStep + 1, questions.length, quizSessionId || 'unknown', 'medicare');
    } catch {}
    
    console.log('📝 Quiz Answer Received:', {
      sessionId: quizSessionId,
      step: currentStep + 1,
      questionId: currentQuestion.id,
      questionTitle: currentQuestion.title,
      answer: answer,
      answerType: typeof answer,
      timestamp: new Date().toISOString()
    });
    
    // Handle funnel routing
    if (currentQuestion.id === 'investableAssets') {
      if (answer === 'No, I have less than $100,000') {
        console.log('🔄 Funnel Switch: Primary → Secondary', {
          sessionId: quizSessionId,
          reason: 'Assets below $100k threshold',
          timestamp: new Date().toISOString()
        });
        setFunnelType('secondary');
        setCurrentStep(0); // Reset to first question of secondary funnel
        setAnswers({});
        return;
      }
    }

    // Store answer first
    const updatedAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(updatedAnswers);

    // Handle personal info submission - save email for retargeting
    if (currentQuestion.id === 'personalInfo') {
      console.log('📧 Personal Info Submitted - Capturing Email for Retargeting');
      
      const emailCaptureData = {
        email: answer.email,
        firstName: answer.firstName,
        lastName: answer.lastName,
        quizAnswers: updatedAnswers,
        sessionId: quizSessionId || 'unknown',
        funnelType: funnelType,
        zipCode: updatedAnswers.locationInfo?.zipCode,
        state: updatedAnswers.locationInfo?.state,
        stateName: updatedAnswers.locationInfo?.stateName,
        licensingInfo: updatedAnswers.locationInfo?.licensing,
        utmParams: utmParams // Include UTM parameters
      };

      try {
        const response = await fetch(buildApiUrl('/api/leads/capture-email'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailCaptureData)
        });

        const result = await response.json();
        if (result.success) {
          console.log('✅ Email Captured for Retargeting:', { eventId: result.eventId, email: answer.email });
        } else {
          console.error('❌ Email Capture Failed:', result.error);
        }
      } catch (error) {
        console.error('💥 Email Capture Exception:', error);
      }
    }

    // Handle phone number submission - go directly to OTP
    if (currentQuestion.id === 'phone') {
      console.log('📱 Phone Number Submitted - Initiating OTP Flow:', {
        sessionId: quizSessionId || 'unknown',
        phoneNumber: answer,
        timestamp: new Date().toISOString()
      });
      
      setShowOTP(true);
      console.log('🔐 OTP State Set to True - Should show OTP verification next');
      return;
    }
    
    // Check if this is the last question
    if (currentStep === questions.length - 1) {
      console.log('🏁 Quiz Completed - All Questions Answered:', {
        sessionId: quizSessionId,
        totalSteps,
        allAnswers: updatedAnswers,
        timestamp: new Date().toISOString()
      });
      // Quiz completed, show results
      setShowResults(true);
      calculateResults();
    } else {
      const nextStep = currentStep + 1;
      console.log('➡️ Moving to Next Step:', {
        sessionId: quizSessionId,
        fromStep: currentStep + 1,
        toStep: nextStep + 1,
        nextQuestionId: questions[nextStep].id,
        timestamp: new Date().toISOString()
      });
      setCurrentStep(nextStep);
    }
  };

  const calculateResults = () => {
    console.log('🧮 Calculating Quiz Results:', {
      sessionId: quizSessionId,
      answers,
      funnelType,
      timestamp: new Date().toISOString()
    });

    // Track quiz completion
    try {
      const completionTime = Date.now() - ((window as any).quizStartTime || Date.now());
      trackQuizComplete('annuity', quizSessionId || 'unknown', 'medicare', completionTime);
    } catch {}

    // Calculate projected monthly income based on answers
    const retirementSavings = answers.retirementSavings;
    let projectedMonthlyIncomeMin = 0;
    let projectedMonthlyIncomeMax = 0;

    // Simple calculation based on retirement savings
    switch (retirementSavings) {
      case '$1,000,000+':
        projectedMonthlyIncomeMin = 4000;
        projectedMonthlyIncomeMax = 6000;
        break;
      case '$750,000 - $999,999':
        projectedMonthlyIncomeMin = 3000;
        projectedMonthlyIncomeMax = 4500;
        break;
      case '$500,000 - $749,999':
        projectedMonthlyIncomeMin = 2000;
        projectedMonthlyIncomeMax = 3500;
        break;
      case '$250,000 - $499,999':
        projectedMonthlyIncomeMin = 1000;
        projectedMonthlyIncomeMax = 2500;
        break;
      case '$100,000 - $249,999':
        projectedMonthlyIncomeMin = 500;
        projectedMonthlyIncomeMax = 1500;
        break;
      default:
        projectedMonthlyIncomeMin = 300;
        projectedMonthlyIncomeMax = 800;
    }

    const calculatedResults = {
      projected_monthly_income_min: projectedMonthlyIncomeMin,
      projected_monthly_income_max: projectedMonthlyIncomeMax
    };

    console.log('✅ Quiz Results Calculated:', {
      sessionId: quizSessionId,
      calculatedResults,
      timestamp: new Date().toISOString()
    });

    return calculatedResults;
  };

  const handleOTPVerification = async () => {
    console.log('🔐 OTP Verification Complete - Sending to GHL:', {
      sessionId: quizSessionId,
      phoneNumber: answers.phone,
      timestamp: new Date().toISOString()
    });

    setShowOTP(false);
    setShowProcessing(true);

    try {
      const calculatedResults = calculateResults();
      
      // Call server-side proxy to Supabase Edge Function
      const edgeFunctionUrl = '/api/process-lead';
      
      console.log('🚀 Calling Supabase Edge Function:', {
        url: edgeFunctionUrl,
        sessionId: quizSessionId || 'unknown',
        timestamp: new Date().toISOString()
      });

      const edgeResponse = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          site_key: 'SENIORSIMPLE',
          funnel_type: funnelType,
          session_id: quizSessionId || 'unknown',
          user_id: answers.personalInfo?.email,
          contact: {
            email: answers.personalInfo?.email,
            phone: answers.phone,
            first_name: answers.personalInfo?.firstName,
            last_name: answers.personalInfo?.lastName
          },
          quiz_answers: answers,
          lead_score: 75, // Default lead score - Edge Function will calculate proper score
          utm_source: utmParams?.utm_source,
          utm_medium: utmParams?.utm_medium,
          utm_campaign: utmParams?.utm_campaign,
          zip_code: answers.locationInfo?.zipCode,
          state: answers.locationInfo?.state,
          state_name: answers.locationInfo?.stateName,
          consent: true
        })
      });

      let edgeResult: any = null
      try {
        edgeResult = await edgeResponse.json()
      } catch {
        const rawText = await edgeResponse.text()
        edgeResult = { raw: rawText }
      }
      
      if (edgeResponse.ok && edgeResult.status === 'success') {
        console.log('✅ Lead Processed by Edge Function Successfully:', { 
          leadId: edgeResult.lead_id,
          leadScore: edgeResult.lead_score,
          qualified: edgeResult.qualified,
          sessionId: quizSessionId || 'unknown',
          timestamp: new Date().toISOString()
        });

        // Fire direct client-side GHL webhook in parallel for speed
        try {
          const ghlUrl = process.env.NEXT_PUBLIC_GHL_WEBHOOK_SENIORSIMPLE || 'https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6'
          const ghlPayload = {
            firstName: answers.personalInfo?.firstName,
            lastName: answers.personalInfo?.lastName,
            email: answers.personalInfo?.email,
            phone: answers.phone,
            zipCode: answers.locationInfo?.zipCode,
            state: answers.locationInfo?.state,
            stateName: answers.locationInfo?.stateName,
            source: 'SeniorSimple Quiz',
            funnelType: funnelType,
            quizAnswers: answers,
            leadScore: edgeResult.lead_score || 75,
            utmParams: utmParams || {},
            timestamp: new Date().toISOString()
          }

          // Non-blocking fire-and-forget
          fetch(ghlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ghlPayload)
          }).then(res => {
            if (res.ok) {
              console.log('✅ GHL webhook (client) sent successfully')
            } else {
              console.warn('⚠️ GHL webhook (client) non-200', res.status)
            }
          }).catch(err => console.error('❌ GHL webhook (client) error', err))
        } catch (err) {
          console.error('❌ GHL webhook (client) exception', err)
        }
      } else {
        console.error('❌ Edge Function Failed:', { 
          error: edgeResult.error || 'Unknown error',
          details: edgeResult.details || edgeResult.raw,
          status: edgeResponse.status,
          sessionId: quizSessionId || 'unknown',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('💥 OTP Verification & GHL Lead Distribution Exception:', { 
        error, 
        sessionId: quizSessionId || 'unknown',
        timestamp: new Date().toISOString()
      });
    }

    setShowProcessing(false);
    setShowResults(true);
    
    // Store quiz answers for personalized thank you message
    sessionStorage.setItem('quiz_answers', JSON.stringify(answers));
    
    // Route to pageview tracking page
    try {
      router.push('/quiz-submitted');
    } catch {}
  };

  const submitQuizToDatabase = async () => {
    console.log('📤 Starting Lead Submission to Database:', {
      sessionId: quizSessionId,
      timestamp: new Date().toISOString()
    });

    try {
      const calculatedResults = calculateResults();
      
      // Extract location data from answers
      const locationData = answers.locationInfo || {};
      
      const leadData = {
        contact_info: {
          first_name: answers.personalInfo?.firstName || answers.firstName,
          last_name: answers.personalInfo?.lastName || answers.lastName,
          email: answers.personalInfo?.email || answers.email,
          phone: answers.phone,
          zip_code: locationData.zipCode || answers.zipCode,
          state: locationData.state || '',
          state_name: locationData.stateName || '',
          address: locationData.address || '',
          city: locationData.city || ''
        },
        quiz_answers: answers,
        calculated_results: calculatedResults,
        lead_score: 75, // Default lead score
        licensing_info: locationData.licensing || {},
        funnel_type: funnelType,
        quiz_session_id: quizSessionId
      };

      console.log('📊 Lead Data Prepared for Submission:', {
        sessionId: quizSessionId,
        leadData,
        timestamp: new Date().toISOString()
      });

      // Track lead form submission
      const trackingLeadData: LeadData = {
        firstName: leadData.contact_info.first_name,
        lastName: leadData.contact_info.last_name,
        email: leadData.contact_info.email,
        phoneNumber: leadData.contact_info.phone,
        zipCode: leadData.contact_info.zip_code,
        state: leadData.contact_info.state,
        stateName: leadData.contact_info.state_name,
        quizAnswers: answers,
        sessionId: quizSessionId || 'unknown',
        funnelType: 'annuity',
        leadScore: leadData.lead_score
      };

      trackLeadFormSubmit(trackingLeadData);
      sendCAPILeadEventMultiSite(trackingLeadData);

      // TODO: Implement actual Supabase submission
      // For now, just log the data - we'll implement proper submission later
      console.log('⚠️ Lead Data Logged (Not Submitted to Database Yet):', leadData);

      console.log('✅ Lead Submission Process Complete:', {
        sessionId: quizSessionId,
        success: true,
        timestamp: new Date().toISOString()
      });

      // Add delay to allow GTM to process tracking events before redirect
      console.log('⏳ Waiting for GTM to process tracking events...');
      setTimeout(() => {
        setShowProcessing(false);
        setShowResults(true);
        
        // Store quiz answers for personalized thank you message
        sessionStorage.setItem('quiz_answers', JSON.stringify(answers));
        
        try { router.push('/quiz-submitted'); } catch {}
      }, 2000); // 2 second delay
    } catch (error) {
      console.error('💥 Lead Submission Error:', {
        sessionId: quizSessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      setShowProcessing(false);
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    console.log('🔄 Quiz Restart Initiated:', {
      sessionId: quizSessionId,
      timestamp: new Date().toISOString()
    });

    setCurrentStep(0);
    setAnswers({});
    setFunnelType('primary');
    setShowResults(false);
    setShowOTP(false);
    setShowProcessing(false);
    setQuizSessionId(null);
  };

  if (showProcessing) {
    console.log('⏳ Showing Processing State:', {
      sessionId: quizSessionId,
      timestamp: new Date().toISOString()
    });
    return <ProcessingState message="Processing your information..." />;
  }

  if (showOTP) {
    console.log('📱 Showing OTP Verification:', {
      sessionId: quizSessionId,
      phoneNumber: answers.phone,
      showOTP: true,
      timestamp: new Date().toISOString()
    });
    return (
      <OTPVerification
        phoneNumber={answers.phone}
        onVerificationComplete={handleOTPVerification}
        onBack={() => setShowOTP(false)}
      />
    );
  }

  if (showResults) {
    console.log('🎯 Showing Agent Assignment Page:', {
      sessionId: quizSessionId,
      timestamp: new Date().toISOString()
    });
    return (
      <AgentAssignmentPage
        answers={answers}
        onRestart={handleRestart}
      />
    );
  }

  console.log('📋 Rendering Quiz Question:', {
    sessionId: quizSessionId,
    currentStep: currentStep + 1,
    totalSteps,
    questionId: questions[currentStep].id,
    questionTitle: questions[currentStep].title,
    showOTP: showOTP,
    showResults: showResults,
    showProcessing: showProcessing,
    timestamp: new Date().toISOString()
  });

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
          />
        )}
      </div>
    </div>
  );
};