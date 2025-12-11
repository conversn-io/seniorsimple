
'use client';

import { useState } from "react";
import QuizErrorBoundary from "../quiz/QuizErrorBoundary";
import { AnnuityQuiz } from "../quiz/AnnuityQuiz";
import { useFunnelLayout } from "../../hooks/useFunnelFooter";
import "../../styles/quiz-mobile.css";

interface QuizProps {
  skipOTP?: boolean;
}

const Quiz = ({ skipOTP = false }: QuizProps) => {
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
              {/* Pre-Header: Scarcity Frame */}
              <p className="text-sm sm:text-base text-[#2f6d46] font-medium mb-3 sm:mb-4">
                Only 30% of Americans with $250K+ qualify for this retirement strategy.
              </p>
              
              {/* Headline: Emotional Hook - Reduced by 25% */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#36596A] mb-4 sm:mb-6 leading-tight">
                Will Your Retirement Survive the Next Market Crash?
              </h1>
              
              {/* Subhead: Builds Value - Reduced by 25% */}
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-4 sm:mb-6 leading-relaxed max-w-3xl mx-auto font-medium">
                Answer a few quick questions to see if you qualify for <span className="text-[#36596A] font-bold">Retirement Rescue™</span> — a strategy that protects your savings from crashes, eliminates forced withdrawals, and gives you income for life <span className="italic">without risky investments.</span>
              </p>
            </div>
          )}
          <div className="max-w-2xl mx-auto">
            <AnnuityQuiz skipOTP={skipOTP} onStepChange={setCurrentStep} />
          </div>
        </section>
        {/* Footer is now handled by layout */}
      </div>
    </QuizErrorBoundary>
  );
};

export default Quiz;
