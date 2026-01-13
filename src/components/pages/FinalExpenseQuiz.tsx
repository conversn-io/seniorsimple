'use client';

import { useState, useEffect } from "react";
import QuizErrorBoundary from "../quiz/QuizErrorBoundary";
import { FinalExpenseQuiz } from "../quiz/FinalExpenseQuiz";
import { useFunnelLayout } from "../../hooks/useFunnelFooter";
import { trackGA4Event } from "../../lib/temp-tracking";
import "../../styles/quiz-mobile.css";

interface FinalExpenseQuizProps {
  skipOTP?: boolean;
}

const FinalExpenseQuizPage = ({ skipOTP = false }: FinalExpenseQuizProps) => {
  useFunnelLayout(); // This sets both header and footer to 'funnel'
  const [currentStep, setCurrentStep] = useState(0);
  const showHeadline = currentStep === 0;

  const handleQuizReset = () => {
    // Force a page refresh to fully reset the quiz state
    window.location.reload();
  };

  return (
    <QuizErrorBoundary onReset={handleQuizReset}>
      <div className="min-h-screen bg-[#F5F5F0]">
        <section className={`${showHeadline ? 'py-8 sm:py-12' : 'pt-4 pb-8 sm:pb-12'} px-4 sm:px-6 lg:px-8`}>
          {showHeadline && (
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#36596A] mb-4 sm:mb-6 leading-tight">
                Get Your Free Final Expense Life Insurance Quote
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-4 sm:mb-6 leading-relaxed max-w-3xl mx-auto font-medium">
                Protect your loved ones from funeral and burial expenses. Get matched with licensed agents in your area who specialize in final expense insurance.
              </p>
              
              <p className="text-sm text-gray-600 mt-4">
                Free • Secure • Takes 2–3 minutes • No medical exam required
              </p>
            </div>
          )}
          
          <FinalExpenseQuiz skipOTP={skipOTP} onStepChange={setCurrentStep} />
        </section>
      </div>
    </QuizErrorBoundary>
  );
};

export default FinalExpenseQuizPage;

