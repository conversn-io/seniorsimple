'use client';

import { useState, useEffect } from "react";
import QuizErrorBoundary from "../quiz/QuizErrorBoundary";
import { AnnuityQuoteQuiz } from "../quiz/AnnuityQuoteQuiz";
import { useFunnelLayout } from "../../hooks/useFunnelFooter";
import { trackGA4Event } from "../../lib/temp-tracking";
import "../../styles/quiz-mobile.css";

interface AnnuityQuoteQuizProps {
  skipOTP?: boolean;
}

type HeadlineVariant = 'A' | 'B';

const AnnuityQuoteQuizPage = ({ skipOTP = false }: AnnuityQuoteQuizProps) => {
  useFunnelLayout(); // This sets both header and footer to 'funnel'
  const [currentStep, setCurrentStep] = useState(0);
  const [headlineVariant, setHeadlineVariant] = useState<HeadlineVariant>('A');
  const showHeadline = currentStep === 0;

  // A/B Testing: Assign variant on mount and track it
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if variant already assigned in this session
    const storedVariant = sessionStorage.getItem('annuity_quote_headline_variant') as HeadlineVariant | null;
    
    if (storedVariant && (storedVariant === 'A' || storedVariant === 'B')) {
      // Use stored variant to maintain consistency
      setHeadlineVariant(storedVariant);
      
      // Track variant view (only once per session)
      const variantTracked = sessionStorage.getItem('annuity_quote_variant_tracked');
      if (!variantTracked) {
        trackGA4Event('ab_test_view', {
          test_name: 'annuity_quote_headline',
          variant: storedVariant,
          page_path: '/annuity-quote',
          event_category: 'ab_testing'
        });
        sessionStorage.setItem('annuity_quote_variant_tracked', 'true');
      }
    } else {
      // Assign variant randomly (50/50 split)
      const variant: HeadlineVariant = Math.random() < 0.5 ? 'A' : 'B';
      sessionStorage.setItem('annuity_quote_headline_variant', variant);
      setHeadlineVariant(variant);
      
      // Track variant assignment
      trackGA4Event('ab_test_view', {
        test_name: 'annuity_quote_headline',
        variant: variant,
        page_path: '/annuity-quote',
        event_category: 'ab_testing'
      });
      sessionStorage.setItem('annuity_quote_variant_tracked', 'true');
    }
  }, []);

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
              {headlineVariant === 'A' ? (
                <>
                  {/* Option A */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#36596A] mb-4 sm:mb-6 leading-tight">
                    Turn Your Retirement Savings Into Guaranteed Monthly Income
                  </h1>
                  
                  <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-4 sm:mb-6 leading-relaxed max-w-3xl mx-auto font-medium">
                    Compare today's top annuity options and see how much lifetime income your savings can safely generate
                  </p>
                  
                  <p className="text-sm text-gray-600 mt-4">
                    Free • Secure • Takes 2–3 minutes
                  </p>
                </>
              ) : (
                <>
                  {/* Option B */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#36596A] mb-4 sm:mb-6 leading-tight">
                    Never Worry About Outliving Your Retirement Income
                  </h1>
                  
                  <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-4 sm:mb-6 leading-relaxed max-w-3xl mx-auto font-medium">
                    See how an annuity can provide guaranteed monthly income for the rest of your life
                  </p>
                  
                  <p className="text-sm text-gray-600 mt-4">
                    Free • Secure • Retirement-focused
                  </p>
                </>
              )}
            </div>
          )}
          <div className="max-w-2xl mx-auto">
            <AnnuityQuoteQuiz skipOTP={skipOTP} onStepChange={setCurrentStep} />
          </div>
        </section>
        {/* Footer is now handled by layout */}
      </div>
    </QuizErrorBoundary>
  );
};

export default AnnuityQuoteQuizPage;

