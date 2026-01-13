'use client';

import { useEffect, useState } from 'react';
import { AgentAssignmentPage } from '@/components/quiz/AgentAssignmentPage';
import { initializeTracking, trackPageView } from '@/lib/temp-tracking';

export default function FinalExpenseResultsPage() {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load quiz answers from sessionStorage or localStorage
    const loadQuizAnswers = () => {
      try {
        const sessionAnswers = sessionStorage.getItem('quiz_answers');
        const localAnswers = localStorage.getItem('quiz_answers');
        
        const answers = sessionAnswers 
          ? JSON.parse(sessionAnswers)
          : localAnswers 
            ? JSON.parse(localAnswers)
            : {};
        
        setQuizAnswers(answers);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading quiz answers:', error);
        setIsLoading(false);
      }
    };

    loadQuizAnswers();

    // Initialize tracking
    initializeTracking();
    trackPageView('Final Expense Quote Results', '/final-expense-quote/results');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#36596A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <AgentAssignmentPage 
      answers={quizAnswers} 
      onRestart={() => window.location.href = '/final-expense-quote'}
      funnelType="final-expense-quote"
    />
  );
}

