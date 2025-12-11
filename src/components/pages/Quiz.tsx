
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
              
              {/* Headline: Emotional Hook */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#36596A] mb-4 sm:mb-6 leading-tight">
                Will Your Retirement Survive the Next Market Crash?
              </h1>
              
              {/* Subhead: Builds Value */}
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-4 sm:mb-6 leading-relaxed max-w-3xl mx-auto font-medium">
                Answer a few quick questions to see if you qualify for <span className="text-[#36596A] font-bold">Retirement Rescue™</span> — a strategy that protects your savings from crashes, eliminates forced withdrawals, and gives you income for life <span className="italic">without risky investments.</span>
              </p>
              
              {/* Lead-In / Microcopy */}
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto">
                Take the 60-second Retirement Rescue™ Quiz now and discover whether you're eligible for a strategy that most advisors <strong>can't offer</strong> — but could change your entire retirement outcome.
              </p>
              
              {/* Trust Boost */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6 text-sm sm:text-base text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>IRS-Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>No High-Risk Investments</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>No Advisor Fees</span>
                </div>
              </div>
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
