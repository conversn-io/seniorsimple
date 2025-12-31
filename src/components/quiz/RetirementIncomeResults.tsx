'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView, trackGA4Event } from '@/lib/temp-tracking';
import { CheckCircle } from 'lucide-react';

interface QuizData {
  answers: Record<string, any>;
  score: number;
  resultsPath: string;
  sessionId: string;
}

type ResultsTier = 'high' | 'mid' | 'low';

interface RetirementIncomeResultsProps {
  tier: ResultsTier;
}

export const RetirementIncomeResults = ({ tier }: RetirementIncomeResultsProps) => {
  useFunnelLayout();
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeTracking();
    trackPageView(`Retirement Income Quiz Results - ${tier}`, `/quiz-results/${tier}`);
    
    // Track results page view
    trackGA4Event('quiz_results_view', {
      test_name: 'retirement_income_quiz',
      tier: tier,
      page_path: `/quiz-results/${tier}`,
      event_category: 'quiz_results'
    });

    // Load quiz data from sessionStorage
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('retirement_income_quiz_data');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setQuizData(data);
        } catch (error) {
          console.error('Failed to parse quiz data:', error);
        }
      }
      setIsLoading(false);
    }
  }, [tier]);

  const handleCTAClick = () => {
    trackGA4Event('cta_click', {
      test_name: 'retirement_income_quiz',
      tier: tier,
      cta_text: 'Get Retirement Income Blueprint',
      page_path: `/quiz-results/${tier}`,
      event_category: 'quiz_results'
    });
    router.push('/retirement-income-blueprint');
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

  const score = quizData?.score || 0;

  // Content based on tier
  const content = {
    high: {
      headline: "You're Well-Prepared, But There's Always Room to Optimize",
      subhead: `With a score of ${score} out of 9, you've shown strong awareness of retirement income planning. You understand the importance of tax efficiency, inflation protection, and market volatility.`,
      message: "You're already thinking strategically about your retirement income. The Retirement Income Blueprint™ can help you refine your approach and discover advanced strategies you may not have considered.",
      benefits: [
        "Advanced tax reduction strategies for retirement accounts",
        "Inflation protection techniques beyond basic planning",
        "Market volatility protection strategies",
        "Optimization strategies for your existing plan"
      ]
    },
    mid: {
      headline: "You're On the Right Track, But There Are Gaps to Address",
      subhead: `With a score of ${score} out of 9, you have a solid foundation but may be missing some key strategies that could significantly improve your retirement income security.`,
      message: "You understand some important concepts, but there are critical gaps in your retirement income planning. The Retirement Income Blueprint™ will help you fill those gaps and create a more comprehensive strategy.",
      benefits: [
        "Complete retirement income planning framework",
        "Tax-efficient withdrawal strategies",
        "Inflation protection planning",
        "Market volatility protection strategies",
        "RMD optimization techniques"
      ]
    },
    low: {
      headline: "You Have Important Questions—Let's Get You Answers",
      subhead: `With a score of ${score} out of 9, you're recognizing that there's more to learn about retirement income planning. This is actually a great starting point.`,
      message: "It's completely normal to have questions about retirement income planning. The Retirement Income Blueprint™ is designed specifically for people like you who want to understand their options and create a clear, actionable plan.",
      benefits: [
        "Foundational retirement income planning concepts",
        "Understanding of tax implications and RMDs",
        "Inflation protection basics",
        "Market volatility protection strategies",
        "Step-by-step action plan"
      ]
    }
  };

  const tierContent = content[tier];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Score Display */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full px-6 py-3 shadow-md mb-4">
            <span className="text-2xl font-bold text-[#36596A]">Your Score: {score}/9</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#36596A] mb-4 text-center">
            {tierContent.headline}
          </h1>
          
          <p className="text-lg text-gray-700 mb-6 text-center leading-relaxed">
            {tierContent.subhead}
          </p>

          <p className="text-base text-gray-600 mb-8 leading-relaxed">
            {tierContent.message}
          </p>

          {/* Benefits List */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#36596A] mb-4">
              What You'll Learn in the Retirement Income Blueprint™:
            </h2>
            <ul className="space-y-3">
              {tierContent.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Section */}
          <div className="text-center border-t pt-8">
            <h3 className="text-2xl font-bold text-[#36596A] mb-4">
              Get Your Retirement Income Blueprint™
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Complete guide to creating tax-efficient, inflation-protected retirement income
            </p>
            
            <div className="mb-6">
              <div className="text-4xl font-bold text-[#36596A] mb-2">$47</div>
              <p className="text-sm text-gray-600">60-day money-back guarantee</p>
            </div>

            <button
              onClick={handleCTAClick}
              className="bg-[#36596A] text-white px-10 py-4 rounded-lg font-bold text-xl hover:bg-[#2a4a5a] transition-colors shadow-lg hover:shadow-xl mb-4"
            >
              Get Your Blueprint Now
            </button>

            <p className="text-sm text-gray-500">
              Instant digital access • No recurring charges • Secure checkout
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-lg p-6 text-sm text-gray-600">
          <p className="font-semibold mb-2">Educational Disclaimer:</p>
          <p>
            This quiz and the Retirement Income Blueprint™ are for educational purposes only and do not constitute individualized financial advice. 
            Consult with a qualified financial advisor before making any financial decisions. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </div>
  );
};

