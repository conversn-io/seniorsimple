'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView, trackGA4Event } from '@/lib/temp-tracking';
import { Shield, Lock, CreditCard, CheckCircle2 } from 'lucide-react';

interface QuizData {
  answers: Record<string, any>;
  rawScore: number;
  percentile: number;
  resultsPath: string;
  sessionId: string;
  leadData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
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
    // Scroll to iframe instead of navigating
    const iframeElement = document.getElementById('checkout-iframe');
    if (iframeElement) {
      iframeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  const percentile = quizData?.percentile || 0;
  const firstName = quizData?.leadData?.firstName || '';

  // Content based on tier - using actual copy from markdown
  const content = {
    high: {
      headline: "Your Results Are In — And You're Ahead of Most Retirees",
      opening: "First, congratulations.",
      body: [
        "Based on your answers, you're already thinking about retirement the **right way** — not just *how much* you've saved, but **how that money will actually support your life**.",
        "Most people never get this far.",
        "You've clearly thought about:",
        "• Inflation",
        "• Taxes and RMDs",
        "• Market risk",
        "• Long‑term income, not just account balances",
        "That puts you in a strong position.",
        "But here's the part that often surprises people like you…"
      ],
      section1Title: "Awareness Alone Doesn't Create Income",
      section1Body: [
        "Even financially responsible retirees with $500,000+ saved often find themselves asking:",
        "• *\"Am I taking too much… or not enough?\"*",
        "• *\"What happens if markets drop early in retirement?\"*",
        "• *\"Why do taxes suddenly feel higher now?\"*",
        "• *\"Should I be creating income… or staying invested?\"*",
        "These aren't intelligence problems.",
        "They're **planning problems**.",
        "And the solution isn't another opinion — it's a **clear income framework**."
      ],
      section2Title: "What High‑Confidence Retirees Do Differently",
      section2Body: [
        "The retirees who feel the most calm and confident don't rely on hope or guesswork.",
        "They have:",
        "• A **predictable monthly income plan**",
        "• A strategy for **inflation and taxes**",
        "• A way to avoid selling investments during downturns",
        "• And a clear understanding of *how long their money is designed to last*",
        "That's exactly what the **Retirement Income Blueprint™** was built to provide."
      ],
      ctaTitle: "Your Recommended Next Step",
      ctaSubtitle: "🎯 The Retirement Income Blueprint™",
      ctaBody: [
        "For a one‑time investment of **just $47**, you'll get a step‑by‑step system that shows you how to:",
        "• Turn your existing savings into **$3,000–$7,000/month** in predictable income",
        "• Reduce lifetime retirement taxes",
        "• Protect income from market volatility",
        "• Coordinate withdrawals, Social Security, and future RMDs",
        "• Finally *know* where you stand — instead of wondering",
        "You're not starting from scratch.",
        "You're refining and strengthening what you already have."
      ],
      ctaButton: "YES — Show Me the Retirement Income Blueprint™ ($47)",
      ps: "People at your level of awareness usually wish they'd done this sooner — not later. This is how you turn smart thinking into lasting confidence."
    },
    mid: {
      headline: "Your Results Show You've Done Some Things Right — But There Are Gaps",
      opening: "You've clearly been responsible.",
      body: [
        "You've saved.",
        "You've thought about retirement.",
        "And you know this phase of life requires smarter decisions.",
        "But based on your answers, there are **important pieces missing** — and those gaps can quietly cost retirees tens or even hundreds of thousands of dollars over time.",
        "Not because they did anything wrong…",
        "But because no one showed them how retirement income *actually* works."
      ],
      section1Title: "The Hidden Risk Most Retirees Don't See",
      section1Body: [
        "Here's what often happens:",
        "People assume that because they've saved well, the income part will \"work itself out.\"",
        "But retirement is different.",
        "Now you're dealing with:",
        "• Inflation slowly eroding buying power",
        "• Taxes increasing as RMDs begin",
        "• Market downturns that can permanently damage income",
        "• Uncertainty around how much is actually \"safe\" to use",
        "Without a plan, even a solid nest egg can feel fragile."
      ],
      section2Title: "Why This Stage Is So Important",
      section2Body: [
        "This is the **fork in the road** for most retirees.",
        "One path leads to:",
        "• Constant second‑guessing",
        "• Overspending or underspending",
        "• Anxiety every time the market moves",
        "The other path leads to:",
        "• Predictable income",
        "• Clear guardrails",
        "• Confidence that your money is built to last",
        "The difference is having a **clear income blueprint**."
      ],
      ctaTitle: "Your Smartest Next Move",
      ctaSubtitle: "📘 The Retirement Income Blueprint™",
      ctaBody: [
        "This is a practical, easy‑to‑follow system designed for people exactly where you are right now.",
        "Inside, you'll learn how to:",
        "• Create dependable monthly income from your savings",
        "• Avoid common withdrawal and tax mistakes",
        "• Protect your income from market volatility",
        "• Make smarter decisions around Social Security and future RMDs",
        "• Replace uncertainty with clarity",
        "All for **less than the cost of a dinner out**."
      ],
      ctaButton: "GET THE RETIREMENT INCOME BLUEPRINT™ ($47)",
      ps: "Most people in your position wait too long — and end up reacting instead of planning. This is your chance to get ahead of the curve."
    },
    low: {
      headline: "Your Results Suggest Your Retirement Income Plan Is Vulnerable",
      opening: "Thank you for answering honestly.",
      body: [
        "Based on your responses, there's a strong chance your retirement savings are exposed to risks you may not fully see yet.",
        "That doesn't mean you've failed.",
        "It means you've been **flying without a clear income plan** — which is extremely common.",
        "Unfortunately, it's also where many retirees get hurt."
      ],
      section1Title: "What This Often Leads To (If Nothing Changes)",
      section1Body: [
        "Without a clear strategy, retirees in this situation often experience:",
        "• Taking too much too early — or far too little",
        "• Higher‑than‑expected taxes once RMDs begin",
        "• Selling investments during market downturns",
        "• Losing purchasing power to inflation",
        "• Constant anxiety about \"what happens later\"",
        "The worst part?",
        "These problems usually show up **years after the decisions were made** — when it's harder to course‑correct."
      ],
      section2Title: "The Good News: This Is Fixable",
      section2Body: [
        "You don't need to be a financial expert.",
        "You don't need to gamble on the market.",
        "And you don't need to hand your money to someone and \"hope for the best.\"",
        "What you need is:",
        "• A **simple, clear income framework**",
        "• A way to understand how your money is supposed to work",
        "• A plan that prioritizes stability, income, and longevity",
        "That's exactly why the **Retirement Income Blueprint™** exists."
      ],
      ctaTitle: "Your Immediate Recommendation",
      ctaSubtitle: "🚨 The Retirement Income Blueprint™",
      ctaBody: [
        "This step‑by‑step system shows you:",
        "• How to turn savings into dependable monthly income",
        "• How to avoid major tax and withdrawal mistakes",
        "• How to protect yourself from market crashes",
        "• How to regain clarity and control — quickly",
        "It's available today for **just $47**, with a full 60‑day guarantee."
      ],
      ctaButton: "SECURE MY RETIREMENT INCOME BLUEPRINT™ ($47)",
      ps: "Doing nothing is still a decision — and it's often the most expensive one. This is your opportunity to take control before small gaps become big problems."
    }
  };

  const tierContent = content[tier];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Score Display - Percentile */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full px-6 py-3 shadow-md mb-4">
            <span className="text-2xl font-bold text-[#36596A]">Your Score: {percentile}th Percentile</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#36596A] mb-6 text-center">
            {tierContent.headline}
          </h1>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-lg text-gray-700 mb-4 font-semibold">
              {tierContent.opening}
            </p>
            
            {tierContent.body.map((paragraph, index) => (
              <p key={index} className="text-base text-gray-700 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
            ))}
          </div>

          {/* Section 1 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#36596A] mb-4">
              {tierContent.section1Title}
            </h2>
            <div className="prose prose-lg max-w-none">
              {tierContent.section1Body.map((paragraph, index) => (
                <p key={index} className="text-base text-gray-700 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
              ))}
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#36596A] mb-4">
              {tierContent.section2Title}
            </h2>
            <div className="prose prose-lg max-w-none">
              {tierContent.section2Body.map((paragraph, index) => (
                <p key={index} className="text-base text-gray-700 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 border-t-2 border-[#36596A]">
            <h3 className="text-2xl font-bold text-[#36596A] mb-2">
              {tierContent.ctaTitle}
            </h3>
            <h4 className="text-xl font-semibold text-[#36596A] mb-4">
              {tierContent.ctaSubtitle}
            </h4>
            <div className="prose prose-lg max-w-none mb-6">
              {tierContent.ctaBody.map((paragraph, index) => (
                <p key={index} className="text-base text-gray-700 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
              ))}
            </div>
            
            <button
              onClick={handleCTAClick}
              className="bg-[#36596A] text-white px-10 py-4 rounded-lg font-bold text-xl hover:bg-[#2a4a5a] transition-colors shadow-lg hover:shadow-xl mb-4 w-full"
            >
              {tierContent.ctaButton}
            </button>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                Immediate access
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                60‑day risk‑free guarantee
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                No pressure, no advisor meetings
              </div>
            </div>
          </div>

          {/* P.S. */}
          <p className="text-base text-gray-600 italic border-t pt-6">
            <strong>P.S.</strong> {tierContent.ps}
          </p>
        </div>

        {/* Checkout Iframe Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8" id="checkout-iframe">
          <h2 className="text-2xl font-bold text-[#36596A] mb-4 text-center">
            Complete Your Order
          </h2>
          
          {/* Iframe Container - Tightened to reduce whitespace */}
          <div className="w-full overflow-hidden rounded-lg border-2 border-gray-200" style={{ minHeight: '600px', maxHeight: '800px' }}>
            <iframe
              src="https://offers.callready.io/2-step-order-form-page"
              className="w-full border-0"
              style={{ 
                minHeight: '600px',
                width: '100%',
                border: 'none',
                display: 'block'
              }}
              title="Retirement Income Blueprint Order Form"
              allow="payment"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
              id="checkout-iframe"
            />
          </div>

          {/* Trust Icons */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              Secure Checkout
            </div>
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-green-600 mr-2" />
              SSL Encrypted
            </div>
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-green-600 mr-2" />
              Safe Payment
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
              60-Day Money-Back Guarantee
            </div>
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
