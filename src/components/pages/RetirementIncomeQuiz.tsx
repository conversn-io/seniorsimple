'use client';

import { useState } from "react";
import QuizErrorBoundary from "../quiz/QuizErrorBoundary";
import { RetirementIncomeQuiz } from "../quiz/RetirementIncomeQuiz";
import { useFunnelLayout } from "../../hooks/useFunnelFooter";
import "../../styles/quiz-mobile.css";

const RetirementIncomeQuizPage = () => {
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
                Discover Your Retirement Income Strategy
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-4 sm:mb-6 leading-relaxed max-w-3xl mx-auto font-medium">
                Answer 9 quick questions to get your personalized retirement income assessment and discover strategies to protect and grow your retirement savings.
              </p>
            </div>
          )}
          <div className="max-w-2xl mx-auto">
            <RetirementIncomeQuiz onStepChange={setCurrentStep} />
          </div>
        </section>
      </div>
    </QuizErrorBoundary>
  );
};

export default RetirementIncomeQuizPage;

