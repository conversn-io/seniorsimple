'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView } from '@/lib/temp-tracking';
import { AgentAssignmentPage } from '@/components/quiz/AgentAssignmentPage';

interface QuizAnswers {
  firstName?: string;
  lastName?: string;
  ageRange?: string;
  coverageAmount?: string | number;
  zipCode?: string;
  smoker?: string;
  beneficiaryRelationship?: string;
  personalInfoFinal?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  phone?: string;
  email?: string;
  sessionId?: string;
  [key: string]: any;
}

export default function FinalExpenseThankYouPage() {
  useFunnelLayout(); // Sets header and footer to 'funnel'
  const router = useRouter();
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize tracking
    initializeTracking();
    
    // Track page view for GA4 and Meta Pixel
    trackPageView('Final Expense Quote Results', '/final-expense-quote/thank-you');
    
    // Track thank you view event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'fe_thankyou_view', {
        funnel_type: 'final-expense-quote'
      });
    }
    
    // Get quiz answers from sessionStorage
    const loadQuizAnswers = () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 FINAL EXPENSE THANK YOU PAGE: Loading quiz answers');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Try multiple times with increasing delays to catch data that might be stored asynchronously
      let attemptCount = 0;
      const maxAttempts = 5;
      const attemptDelays = [0, 100, 300, 500, 1000];

      const tryLoadAnswers = (delay: number) => {
        setTimeout(() => {
          attemptCount++;
          
          // Try sessionStorage first (primary source)
          let storedAnswers = sessionStorage.getItem('quiz_answers');
          
          // If not in sessionStorage, try localStorage as fallback
          if (!storedAnswers) {
            storedAnswers = localStorage.getItem('quiz_answers');
            if (storedAnswers) {
              console.log('📦 Found quiz_answers in localStorage (sessionStorage was empty)');
              // Restore to sessionStorage for consistency
              try {
                sessionStorage.setItem('quiz_answers', storedAnswers);
              } catch (e) {
                console.warn('⚠️ Could not restore to sessionStorage:', e);
              }
            }
          }
          
          console.log(`📋 Attempt ${attemptCount}/${maxAttempts} (delay: ${delay}ms):`, {
            found: !!storedAnswers,
            length: storedAnswers?.length || 0,
            source: storedAnswers ? (sessionStorage.getItem('quiz_answers') ? 'sessionStorage' : 'localStorage') : 'none'
          });

          if (storedAnswers) {
            try {
              const answers = JSON.parse(storedAnswers);
              console.log('✅ quiz_answers successfully parsed:', {
                hasPersonalInfo: !!answers.personalInfoFinal,
                hasCoverageAmount: !!answers.coverageAmount,
                keys: Object.keys(answers)
              });
              
              // Ensure sessionId is set
              if (!answers.sessionId) {
                const sessionId = sessionStorage.getItem('session_id') || `final_expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                answers.sessionId = sessionId;
              }
              
              // Ensure funnelType is set
              answers.funnelType = 'final-expense-quote';
              
              setQuizAnswers(answers);
              setIsLoading(false);
            } catch (error) {
              console.error('❌ Failed to parse quiz_answers:', error);
              if (attemptCount < maxAttempts) {
                tryLoadAnswers(attemptDelays[attemptCount]);
              } else {
                setIsLoading(false);
              }
            }
          } else {
            // Try again if we haven't exceeded max attempts
            if (attemptCount < maxAttempts) {
              tryLoadAnswers(attemptDelays[attemptCount]);
            } else {
              console.warn('⚠️ No quiz_answers found after all attempts');
              setIsLoading(false);
            }
          }
        }, delay);
      };

      tryLoadAnswers(attemptDelays[0]);
    };

    loadQuizAnswers();
  }, [router]);

  const handleRestart = () => {
    console.log('🔄 Restarting quiz from thank you page');
    // Clear stored answers
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('quiz_answers');
      localStorage.removeItem('quiz_answers');
    }
    // Navigate back to quiz start
    router.push('/final-expense-quote');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#36596A] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!quizAnswers) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Results Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your quiz results. Please start the quiz again.
          </p>
          <button
            onClick={() => router.push('/final-expense-quote')}
            className="bg-[#36596A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2a4a5a] transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return <AgentAssignmentPage answers={quizAnswers} onRestart={handleRestart} funnelType="final-expense-quote" />;
}

