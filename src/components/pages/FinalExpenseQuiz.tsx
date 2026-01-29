'use client';

import { useState, useEffect } from "react";
import QuizErrorBoundary from "../quiz/QuizErrorBoundary";
import { FinalExpenseQuiz } from "../quiz/FinalExpenseQuiz";
import { useMinimalFunnelLayout } from "../../hooks/useMinimalFunnelLayout";
import { trackGA4Event } from "../../lib/temp-tracking";
import "../../styles/quiz-mobile.css";

interface FinalExpenseQuizProps {
  skipOTP?: boolean;
}

const FinalExpenseQuizPage = ({ skipOTP = false }: FinalExpenseQuizProps) => {
  useMinimalFunnelLayout(); // This sets header to 'funnel' and footer to 'minimal' for lead gen
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
              {/* Headline: Benefit-focused */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#36596A] mb-4 sm:mb-6 leading-tight">
                Protect Your Family From Funeral Costs Without Breaking the Bank
              </h1>
              
              {/* Subheadline: Value proposition */}
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-4 sm:mb-6 leading-relaxed max-w-3xl mx-auto font-medium">
                Get matched with licensed agents who specialize in final expense insurance. Compare quotes from top-rated carriers and find coverage that fits your budget — no medical exam required.
              </p>
              
              {/* Tagline */}
              <p className="text-sm text-gray-600 mt-4">
                Free • Secure • Takes 2–3 minutes
              </p>
            </div>
          )}
          
          <div className="max-w-2xl mx-auto">
            <FinalExpenseQuiz skipOTP={skipOTP} onStepChange={setCurrentStep} />
          </div>
        </section>
      </div>
    </QuizErrorBoundary>
  );
};

export default FinalExpenseQuizPage;

