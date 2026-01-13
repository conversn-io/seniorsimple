'use client';

import { useState, useEffect } from "react";
import QuizErrorBoundary from "../quiz/QuizErrorBoundary";
import { FinalExpenseQuiz } from "../quiz/FinalExpenseQuiz";
import { trackGA4Event } from "../../lib/temp-tracking";
import "../../styles/quiz-mobile.css";

interface FinalExpenseQuizEmbedProps {
  skipOTP?: boolean;
}

const FinalExpenseQuizEmbed = ({ skipOTP = false }: FinalExpenseQuizEmbedProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const showHeadline = currentStep === 0;

  const handleQuizReset = () => {
    window.location.reload();
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    
    // When quiz is engaged (step > 0), scroll to anchor progress bar at top
    if (step > 0 && typeof window !== 'undefined') {
      setTimeout(() => {
        const quizSection = document.getElementById('quiz-embed');
        if (quizSection) {
          quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <QuizErrorBoundary onReset={handleQuizReset}>
      <div className="bg-[#F5F5F0]">
        <section className={`${showHeadline ? 'py-4 sm:py-6' : 'pt-2 pb-4 sm:pb-6'} px-4 sm:px-6 lg:px-8`}>
          {showHeadline && (
            <div className="max-w-4xl mx-auto text-center mb-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#36596A] mb-3 sm:mb-4 leading-tight">
                Get Your Free Final Expense Life Insurance Quote
              </h1>
              
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-3 sm:mb-4 leading-relaxed max-w-3xl mx-auto font-medium">
                Protect your loved ones from funeral and burial expenses. Get matched with licensed agents in your area who specialize in final expense insurance.
              </p>
              
              <p className="text-xs text-gray-600 mt-2">
                Free • Secure • Takes 2–3 minutes • No medical exam required
              </p>
            </div>
          )}
          
          <FinalExpenseQuiz skipOTP={skipOTP} onStepChange={handleStepChange} />
        </section>
      </div>
    </QuizErrorBoundary>
  );
};

export default FinalExpenseQuizEmbed;

