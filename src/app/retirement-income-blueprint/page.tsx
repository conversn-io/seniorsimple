'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView, trackGA4Event } from '@/lib/temp-tracking';
import { Shield, Lock, CreditCard, CheckCircle2, Clock } from 'lucide-react';

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

export default function RetirementIncomeBlueprintPage() {
  useFunnelLayout();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<string>('');
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [tier, setTier] = useState<'high' | 'mid' | 'low'>('mid');

  useEffect(() => {
    initializeTracking();
    trackPageView('Retirement Income Blueprint Offer', '/retirement-income-blueprint');
    
    // Track checkout page view
    trackGA4Event('checkout_view', {
      product: 'retirement_income_blueprint',
      price: 47,
      page_path: '/retirement-income-blueprint',
      event_category: 'ecommerce'
    });

    // Load quiz data from sessionStorage
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('retirement_income_quiz_data');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setQuizData(data);
          
          // Determine tier from resultsPath
          let determinedTier: 'high' | 'mid' | 'low' = 'mid';
          if (data.resultsPath?.includes('/high')) {
            determinedTier = 'high';
          } else if (data.resultsPath?.includes('/mid')) {
            determinedTier = 'mid';
          } else {
            determinedTier = 'low';
          }
          setTier(determinedTier);

          // Generate personalized recommendations
          generateRecommendations(data, determinedTier);
        } catch (error) {
          console.error('Failed to parse quiz data:', error);
          setIsLoadingRecommendations(false);
        }
      } else {
        setIsLoadingRecommendations(false);
      }
    }
  }, []);

  const generateRecommendations = async (data: QuizData, tierValue: 'high' | 'mid' | 'low') => {
    try {
      const response = await fetch('/api/generate-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizAnswers: data.answers,
          tier: tierValue,
          percentile: data.percentile,
          firstName: data.leadData?.firstName || ''
        })
      });

      if (response.ok) {
        const result = await response.json();
        setPersonalizedRecommendations(result.recommendations || '');
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleCTAClick = () => {
    trackGA4Event('cta_click', {
      product: 'retirement_income_blueprint',
      price: 47,
      page_path: '/retirement-income-blueprint',
      event_category: 'ecommerce',
      cta_location: 'sales_letter'
    });
    
    // Scroll to checkout iframe
    const iframeElement = document.getElementById('checkout-iframe');
    if (iframeElement) {
      iframeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const firstName = quizData?.leadData?.firstName || '';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Two Column Layout */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Text Column */}
            <div className="text-center md:text-left order-2 md:order-1">
              <h1 className="text-3xl md:text-5xl font-bold text-[#0D3B66] mb-6 leading-tight">
                Discover How Retirees Are Creating $3,000–$7,000/Month in Predictable Income — Without Stocks, Rentals, or Risky Trades
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Even if you&apos;re not a financial expert, hate watching the markets, or worry about outliving your money.
              </p>
              
              {/* Trust Icons */}
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-sm text-gray-600 mb-8">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-[#F4D35E] mr-2" />
                  Secure Checkout
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-[#F4D35E] mr-2" />
                  12,000+ Served
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-[#F4D35E] mr-2" />
                  Money-Back Guarantee
                </div>
              </div>
            </div>
            
            {/* Image Column */}
            <div className="order-1 md:order-2">
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/offer/hero-couple-v2.png"
                  alt="Happy retired couple enjoying retirement"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations Section */}
      {isLoadingRecommendations ? (
        <section className="bg-[#F9F9F9] py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto mb-4"></div>
              <p className="text-gray-600">Generating your personalized recommendations...</p>
            </div>
          </div>
        </section>
      ) : personalizedRecommendations ? (
        <section className="bg-[#F9F9F9] py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0D3B66] mb-6">
                {firstName ? `${firstName}, Here&apos;s What Your Quiz Results Tell Us:` : 'Here&apos;s What Your Quiz Results Tell Us:'}
              </h2>
              <div className="prose prose-lg max-w-none">
                {personalizedRecommendations.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-base text-gray-700 mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Section 2: Agitate the Problem - Two Column with Image */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Column */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66] mb-6">
                &quot;You Saved for Retirement&hellip; But Nobody Showed You How to Actually <em>Use</em> That Money, Did They?&quot;
              </h2>
              
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                <p>You did what you were told.</p>
                <p>You worked hard. You saved diligently. You lived below your means. Maybe you even maxed out your 401(k) or IRA every year.</p>
                <p>But now that retirement is here — or just around the corner — you&apos;re facing questions you were never taught to answer:</p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li>&quot;How much can I take out each month without running out?&quot;</li>
                  <li>&quot;What happens to my income if the market drops 30% again?&quot;</li>
                  <li>&quot;Am I taking too much risk&hellip; or not enough?&quot;</li>
                  <li>&quot;How do I make this money <em>last</em> — without giving up my lifestyle?&quot;</li>
                  <li>&quot;What about taxes&hellip; Medicare premiums&hellip; RMDs&hellip; inflation?&quot;</li>
                </ul>
                
                <p>You&apos;re not alone.</p>
                <p>Even people with <strong>$500,000&hellip; $750,000&hellip; even over a million dollars saved</strong> are worried about the same thing:</p>
                
                {/* Inline advisor image with question */}
                <div className="flex items-start gap-4 my-6">
                  <p className="text-xl font-semibold flex-1">👉 &quot;Do I have <em>enough</em> to retire and stay retired — for good?&quot;</p>
                  <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src="/images/offer/credibility-advisor.png"
                      alt="Financial advisor consultation"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-[#0D3B66] mt-8 mb-4">📉 Retirement is More Confusing Now Than Ever Before</h3>
                <p>Gone are the days of guaranteed pensions.</p>
                <p>Interest rates are all over the place.</p>
                <p>Markets are unpredictable, Social Security is unclear, and the advice you&apos;re getting is&hellip;</p>
                <p>Conflicting. Overwhelming. Or straight-up biased.</p>
                <p>And let&apos;s be honest&hellip;</p>
                <p>Most of what&apos;s out there is <strong>either too basic</strong> (&quot;Just take 4% a year&quot;) or <strong>too complex</strong> (&quot;Use a backdoor Roth glidepath with a dynamic decumulation model&quot;).</p>
                <p>What are you supposed to do with that?</p>
                <p>You&apos;re stuck in the middle — with <strong>real money on the line</strong>&hellip; and no clear answers.</p>
                
                <h3 className="text-2xl font-bold text-[#0D3B66] mt-8 mb-4">😔 The Truth?</h3>
                <p>Most people are better prepared to <em>get</em> to retirement&hellip; Than they are to <em>get through</em> retirement.</p>
                <p>And if you&apos;re feeling anxious, hesitant, or unsure about how to turn your savings into dependable income&hellip;</p>
                <p>You&apos;re not broken. You&apos;re not behind. <strong>You&apos;ve just never been given the blueprint.</strong></p>
                <p className="text-xl font-semibold">Until now.</p>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Section 3: Introduce the Solution */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66] mb-6 text-center">
            There&apos;s a Better Way to Retire — One That Puts You in Control
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>Imagine waking up and knowing exactly what your income will be every month — not guessing, not hoping, not watching the markets with crossed fingers.</p>
            <p>Imagine having a clear, step-by-step plan that shows you:</p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>How much income you can safely draw</strong></li>
              <li><strong>How to stretch your savings over 25–30 years</strong></li>
              <li><strong>How to protect yourself from taxes, inflation, and downturns</strong></li>
              <li><strong>And how to retire with true financial peace of mind</strong></li>
            </ul>
            
            <p>That&apos;s exactly what you&apos;ll get with:</p>
            
            <h3 className="text-3xl font-bold text-[#0D3B66] mt-8 mb-4 text-center">✅ The Retirement Income Blueprint™</h3>
            
            {/* Inline product image below heading */}
            <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] rounded-lg overflow-hidden shadow-xl mb-6">
              <Image
                src="/images/offer/retirement-income-product-mockup-v2.png"
                alt="Retirement Income Blueprint product"
                fill
                className="object-cover"
              />
            </div>
            
            <p className="text-xl font-semibold mb-4 text-center">A straightforward, no-fluff system that helps you turn your nest egg into a reliable income stream — even if you&apos;re not a financial expert.</p>
                
                <p>This isn&apos;t a theory.</p>
                <p>It&apos;s not a &quot;magic formula&quot; or some new investment scheme.</p>
                <p>It&apos;s a <strong>proven framework</strong> that combines the smartest income principles used by fiduciary planners, financial educators, and retirement specialists — broken down in plain English.</p>
                <p>You don&apos;t need to be good with numbers.</p>
                <p>You don&apos;t need to manage spreadsheets or take on risk.</p>
                <p>You just need a guide.</p>
                <p className="text-xl font-semibold"><strong>That&apos;s what the Retirement Income Blueprint is.</strong></p>
                
                <h3 className="text-2xl font-bold text-[#0D3B66] mt-8 mb-4">✅ What Makes This Different?</h3>
                <p>Unlike the generic advice you&apos;ll find online or from commission-hungry advisors, this system is:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Built for people who are already retired or close to it</strong></li>
                  <li>Designed to <strong>maximize income while minimizing risk</strong></li>
                  <li>Created by retirement income specialists, not marketers or traders</li>
                  <li>Written in <strong>simple, practical language</strong> — no jargon, no B.S.</li>
                </ul>
                <p>Whether you&apos;re managing your own money or working with a planner, this blueprint will help you make smarter decisions, ask the right questions, and feel more confident about your next 20–30 years.</p>
                <p>Because at this stage, it&apos;s not about growing your wealth.</p>
                <p>It&apos;s about <strong>preserving it</strong>&hellip; and using it <strong>wisely</strong>.</p>
          </div>
        </div>
      </section>

      {/* Section 4: Establish Credibility - Testimonials with Backgrounds */}
      <section className="bg-[#F9F9F9] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66] mb-12 text-center">
            This Isn&apos;t Theory. It&apos;s a Proven System That&apos;s Helped Over 12,000+ Retirees Create Steady, Predictable Income — Without Guesswork or Gamble.
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4 mb-12">
            <p>The Retirement Income Blueprint™ was built by retirement income specialists with <strong>decades of experience helping real people — not just spreadsheets.</strong></p>
            <p>It&apos;s the result of thousands of real-world case studies, planning sessions, and &quot;kitchen table&quot; conversations with individuals and couples facing the same challenges you are:</p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>How to stretch a 401(k) or IRA without fear</li>
              <li>How to avoid costly, irreversible mistakes with Social Security</li>
              <li>How to build a tax-smart income stream without relying on Wall Street</li>
              <li>How to stop &quot;just hoping&quot; and start planning with clarity</li>
            </ul>
            
            <h3 className="text-2xl font-bold text-[#0D3B66] mt-8 mb-4">🧾 Built By People Who Actually Help Retirees — Not Sell Products</h3>
            <p>Unlike many so-called &quot;financial educators&quot; online&hellip;</p>
            <p>We don&apos;t pitch trendy investment platforms. We don&apos;t push annuities or funds behind the scenes. And we don&apos;t promise overnight results.</p>
            <p>Instead, we focus on <strong>educating you</strong> — clearly, calmly, and truthfully.</p>
            <p>Because you&apos;ve already built your wealth. Now it&apos;s time to <strong>use it wisely.</strong></p>
            <p>And this blueprint gives you the step-by-step roadmap to do just that — without fear, pressure, or confusion.</p>
          </div>
          
          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <div className="hidden md:block absolute inset-0">
                <Image
                  src="/images/offer/testimonial-bg-warm-gradient.png"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="md:hidden absolute inset-0">
                <Image
                  src="/images/offer/testimonial-bg-warm-gradient-mobile.png"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative p-6 text-[#0D3B66]">
                <div className="flex items-center mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-[#0D3B66]">
                    <Image
                      src="/images/offer/testimonial-headshot-man.png"
                      alt="David S."
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">David S.</p>
                    <p className="text-sm opacity-80">68, Retired Engineer</p>
                  </div>
                </div>
                <p className="text-lg italic leading-relaxed">
                  &quot;This blueprint helped me stop second-guessing my entire plan. I now know exactly how much I can take each month and how to make it last — even with inflation.&quot;
                </p>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <div className="hidden md:block absolute inset-0">
                <Image
                  src="/images/offer/testimonial-bg-warm-gradient.png"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="md:hidden absolute inset-0">
                <Image
                  src="/images/offer/testimonial-bg-warm-gradient-mobile.png"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative p-6 text-[#0D3B66]">
                <div className="flex items-center mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-[#0D3B66]">
                    <Image
                      src="/images/offer/testimonial-headshot-woman.png"
                      alt="Karen M."
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Karen M.</p>
                    <p className="text-sm opacity-80">63, Retired Nurse</p>
                  </div>
                </div>
                <p className="text-lg italic leading-relaxed">
                  &quot;I finally feel in control of my retirement income. For the first time in years, I&apos;m not worrying about the market every day.&quot;
                </p>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <div className="hidden md:block absolute inset-0">
                <Image
                  src="/images/offer/testimonial-bg-warm-gradient.png"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="md:hidden absolute inset-0">
                <Image
                  src="/images/offer/testimonial-bg-warm-gradient-mobile.png"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative p-6 text-[#0D3B66]">
                <div className="flex items-center mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-[#0D3B66]">
                    <Image
                      src="/images/offer/testimonial-headshot-couple.png"
                      alt="Paul & Jenny"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Paul & Jenny</p>
                    <p className="text-sm opacity-80">70 & 67, Empty Nesters</p>
                  </div>
                </div>
                <p className="text-lg italic leading-relaxed">
                  &quot;It&apos;s like a GPS for your money in retirement. Easy to follow, realistic, and extremely helpful.&quot;
                </p>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-center text-gray-700">
            This system has now been downloaded by <strong>over 12,000 people</strong> — many of whom had the exact same concerns you do right now.
          </p>
          <p className="text-center text-xl font-semibold text-[#0D3B66] mt-4">
            They took action.
          </p>
          <p className="text-center text-xl font-semibold text-[#0D3B66]">
            You still can too.
          </p>
        </div>
      </section>

      {/* Section 5: Product Preview */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66] mb-12 text-center">
            Here&apos;s Exactly What You&apos;ll Learn Inside the Retirement Income Blueprint™
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Product Image */}
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/images/offer/retirement-income-product-mockup.png"
                alt="Retirement Income Blueprint modules"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Content */}
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>This is not a theory-filled textbook, a financial seminar replay, or a boring stack of spreadsheets.</p>
              <p>It&apos;s a <strong>clear, step-by-step system</strong> that shows you how to turn your retirement savings into <strong>predictable, lasting monthly income</strong> — even if you&apos;re starting from scratch, don&apos;t trust the market, or already have an advisor.</p>
              <p>As soon as you join, you&apos;ll get <strong>instant access</strong> to:</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-[#0D3B66] mb-2">✅ Module 1: The Retirement Income Reset</h3>
              <p className="text-gray-700 italic">The truth about why so many smart retirees still run out of money — and how to build an income plan that won&apos;t let you down.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-[#0D3B66] mb-2">✅ Module 2: The Income Floor Formula</h3>
              <p className="text-gray-700 italic">How to calculate and &quot;lock in&quot; the exact monthly income you need — without gambling, guessing, or worrying about every market dip.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-[#0D3B66] mb-2">✅ Module 3: The 3-Bucket Withdrawal Strategy</h3>
              <p className="text-gray-700 italic">This simple visual system shows you how to stretch your savings 25–30+ years, while still enjoying the lifestyle you worked for.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-[#0D3B66] mb-2">✅ Module 4: The Retirement Tax Gap</h3>
              <p className="text-gray-700 italic">Most retirees overpay taxes by tens of thousands without even realizing it. This module shows you how to avoid that quietly destructive mistake.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-[#0D3B66] mb-2">✅ Module 5: The Market-Proof Plan</h3>
              <p className="text-gray-700 italic">How to build a plan that still works — even if the market crashes or inflation hits hard. (This strategy saved countless retirees in 2008 and 2022.)</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-[#0D3B66] mb-2">✅ Module 6: The Confidence Calendar™</h3>
              <p className="text-gray-700 italic">A week-by-week action plan that walks you through applying everything step-by-step — no guesswork, no overwhelm.</p>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h3 className="text-xl font-bold text-[#0D3B66] mb-4">📘 You&apos;ll Also Receive:</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>A printable workbook to apply the steps in real time</li>
              <li>Templates to run your own income plan or bring to your advisor</li>
              <li>On-demand access (watch anytime, from anywhere)</li>
              <li>Clear, calming narration — not a bunch of confusing jargon</li>
            </ul>
          </div>
          
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-[#0D3B66] mb-4">🧠 Bottom Line?</h3>
            <p className="text-gray-700 mb-4">By the time you finish this program, you&apos;ll know:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>How much monthly income</strong> you can safely draw — and how to make it last</li>
              <li><strong>How to protect your wealth</strong> from volatility, taxes, and silent risks</li>
              <li><strong>How to make smarter decisions</strong> that preserve both your lifestyle <em>and</em> your legacy</li>
            </ul>
            <p className="text-gray-700 mt-4">And you&apos;ll have a real, working <strong>plan</strong> — not just &quot;ideas.&quot;</p>
            <p className="text-gray-700">All for a one-time investment that&apos;s probably <strong>less than what you spent on lunch this week.</strong></p>
          </div>
        </div>
      </section>

      {/* Section 6: Build Desire (Future Pacing) - Single Column with Wrapped Image */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66] mb-6 text-center">
            What If You Could Finally Stop Worrying About Money — and Start Enjoying the Retirement You Worked For?
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p className="text-xl font-semibold">Picture this&hellip;</p>
            <p>You wake up on a Tuesday morning.</p>
            <p>No alarm. No deadlines. No commute.</p>
            <p>You pour a cup of coffee, check your calendar, and realize&hellip; You don&apos;t have to worry about how the markets are doing today.</p>
            <p>You&apos;re not wondering if your account balance is up or down.</p>
            <p>You&apos;re not worried about the IRS, the next recession, or whether your advisor is doing a good job.</p>
            <p className="text-xl font-semibold">Why?</p>
            <p>Because you&apos;ve got <strong>a plan.</strong> A clear, simple, predictable income plan that tells you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>How much money is coming in this month</li>
              <li>Where it&apos;s coming from</li>
              <li>How long it will last</li>
              <li>And how little of it is going to taxes</li>
            </ul>
            <p>Instead of fear, you feel <strong>confidence</strong>. Instead of confusion, you feel <strong>clarity</strong>. Instead of pressure, you feel <strong>peace.</strong></p>
            <ul className="list-none space-y-2">
              <li>✅ You know your bills are covered</li>
              <li>✅ You know your lifestyle is safe</li>
              <li>✅ And you know your money will last — for as long as you do</li>
            </ul>
            <p>You&apos;re not just &quot;getting by&quot; in retirement anymore.</p>
            <p className="text-xl font-semibold">You&apos;re in control.</p>
            <p className="text-xl font-semibold">And that&hellip; is priceless.</p>
            
            {/* Wrapped image */}
            <div className="relative w-full max-w-lg mx-auto aspect-[4/3] rounded-lg overflow-hidden shadow-xl my-8">
              <Image
                src="/images/offer/future-pacing.png"
                alt="Peaceful retirement morning scene"
                fill
                className="object-cover"
              />
            </div>
            
            <h3 className="text-2xl font-bold text-[#0D3B66] mt-8 mb-4">🎯 This Isn&apos;t About Getting Rich.</h3>
            <p>This is about <strong>feeling secure.</strong> It&apos;s about having <strong>enough.</strong> It&apos;s about making smart, measured decisions with the wealth you&apos;ve already built — so you can enjoy the next 20–30 years of your life without constant financial anxiety.</p>
            <p>The Retirement Income Blueprint™ gives you that.</p>
            <p>It won&apos;t make you rich overnight. But it will help you finally feel <strong>rich in the ways that matter</strong>: freedom, peace of mind, and stability.</p>
          </div>
        </div>
      </section>

      {/* Section 7: Stack the Value - Single Column Stacked */}
      <section className="bg-[#FFFCEB] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66] mb-12 text-center">
            Here&apos;s Everything You&apos;re Getting When You Grab the Retirement Income Blueprint™ Today
          </h2>
          
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            {/* Retirement Income Blueprint First */}
            <div>
              <h3 className="text-xl font-bold text-[#0D3B66] mb-2">✅ The Retirement Income Blueprint™</h3>
              <p className="text-gray-700 mb-2">The complete step-by-step digital system to help you safely and confidently turn your savings into a predictable, monthly income stream — one that lasts as long as you do.</p>
              <p className="text-lg font-semibold text-gray-500 line-through">Value: $197</p>
            </div>
            
            {/* Small break */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-xl font-bold text-[#0D3B66] mb-4">Plus These 4 Exclusive Bonuses:</h3>
            </div>
            
            {/* Bonuses Stacked */}
            <div>
              <h3 className="text-xl font-bold text-[#0D3B66] mb-2">🎁 Bonus #1: The 7-Figure Retirement Toolkit</h3>
              <p className="text-gray-700 mb-2">Plug-and-play calculators, checklists, and worksheets that make the entire process simple. No spreadsheets. No tech headaches. Just clarity.</p>
              <p className="text-lg font-semibold text-gray-500 line-through">Value: $97</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#0D3B66] mb-2">🎁 Bonus #2: &quot;The 5 Income Killers&quot; Video Mini-Class</h3>
              <p className="text-gray-700 mb-2">Discover the 5 most common income mistakes retirees make — and how to sidestep them to keep your retirement on track.</p>
              <p className="text-lg font-semibold text-gray-500 line-through">Value: $67</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#0D3B66] mb-2">🎁 Bonus #3: The Social Security Optimization Cheatsheet</h3>
              <p className="text-gray-700 mb-2">Learn exactly how to get the most from Social Security — when to claim, how to coordinate, and what traps to avoid.</p>
              <p className="text-lg font-semibold text-gray-500 line-through">Value: $47</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#0D3B66] mb-2">🧠 Bonus #4: &quot;How to Fire Your Advisor (or Not)&quot; Interview</h3>
              <p className="text-gray-700 mb-2">The no-B.S. guide to knowing if you&apos;re overpaying, being misled, or actually in good hands. Includes 10 smart questions to ask <em>today</em>.</p>
              <p className="text-lg font-semibold text-gray-500 line-through">Value: $47</p>
            </div>
            
            {/* Bonus Visual Stack Image */}
            <div className="relative w-full max-w-lg mx-auto aspect-[4/3] rounded-lg overflow-hidden shadow-xl my-6">
              <Image
                src="/images/offer/bonus-visual-stack.png"
                alt="All bonuses included"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="border-t-2 border-[#0D3B66] pt-6 mt-6">
              <p className="text-2xl font-bold text-gray-700 mb-4">📦 TOTAL REAL VALUE: <span className="line-through">$455.00</span></p>
              <p className="text-gray-700 mb-6">And honestly? At that price, it would still be worth every penny — especially when a single mistake in retirement can cost you tens of thousands of dollars.</p>
              <p className="text-gray-700 mb-6">But you&apos;re not going to pay $455.</p>
              <p className="text-gray-700 mb-6">You won&apos;t even pay $197.</p>
              
              <div className="bg-[#0D3B66] text-white rounded-lg p-6 text-center">
                <p className="text-3xl font-bold mb-2">🎯 Today Only: Just $47</p>
                <p className="text-lg mb-2">One-time payment.</p>
                <p className="text-lg mb-2">No upsells.</p>
                <p className="text-lg mb-2">No subscriptions.</p>
                <p className="text-lg">Instant access to the entire system + all bonuses.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Guarantee - Header 2-col, Content Single Column */}
      <section className="bg-[#F4F4F4] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header: 2-column */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-8">
            {/* Guarantee Badge Image */}
            <div className="flex justify-center md:justify-start">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <Image
                  src="/images/offer/60-day-guarantee.png"
                  alt="60-day money-back guarantee"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            
            {/* Header Text */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66]">
                Try the Entire Retirement Income Blueprint™ for a Full 60 Days — 100% Risk-Free
              </h2>
            </div>
          </div>
          
          {/* Content: Single Column */}
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>We know this decision matters.</p>
            <p>It&apos;s your money. It&apos;s your future. It&apos;s your peace of mind.</p>
            <p>So here&apos;s the deal:</p>
            <p><strong>Try the Retirement Income Blueprint™ for a full 60 days. Go through every module. Use the checklists. Run the numbers. Watch the bonuses.</strong></p>
            <p>And if you don&apos;t feel <strong>more confident</strong>, more prepared, and more in control of your retirement income than ever before&hellip;</p>
            <p>Just send us a one-line email.</p>
            <p>We&apos;ll refund <strong>every penny.</strong> No questions. No hassle. No hoops to jump through.</p>
            
            <h3 className="text-2xl font-bold text-[#0D3B66] mt-8 mb-4">✅ You Have Everything to Gain — and Nothing to Lose.</h3>
            <p>✘ If the system helps you create a smarter retirement income plan? That&apos;s a win.</p>
            <p>✘ If it gives you clarity you never got from your advisor? That&apos;s a win.</p>
            <p>✘ And even if it&apos;s not for you? You still risk nothing.</p>
            <p>We don&apos;t want your money unless this actually <em>helps</em> you.</p>
            <p className="text-xl font-semibold">Fair?</p>
          </div>
        </div>
      </section>

      {/* Section 9: Urgency & Scarcity */}
      <section className="bg-[#FFF8F2] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <Clock className="w-16 h-16 text-[#0D3B66] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66] mb-4">
              This Special $47 Offer (With All Bonuses Included) Won&apos;t Be Around Forever
            </h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>Here&apos;s the truth&hellip;</p>
            <p>The Retirement Income Blueprint™ is part of a <strong>limited-time launch program</strong> we&apos;re offering to a small group of early adopters.</p>
            <p className="text-xl font-semibold">Why?</p>
            <p>Because we&apos;re currently gathering feedback and case studies from new users before we roll this out to our broader audience — where the full retail price will be <strong>$197</strong> and bonuses will be sold separately.</p>
            <p>That means:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>This <strong>$47 discounted access</strong></li>
              <li>These <strong>4 free bonuses</strong></li>
              <li>And the <strong>60-day risk-free guarantee</strong></li>
            </ul>
            <p>...could all disappear once we reach our enrollment cap or complete our test window.</p>
            <p>So if you&apos;re seeing this page right now, that means the offer is <strong>still active</strong> — but it may not be available tomorrow.</p>
            <p className="text-xl font-semibold">Don&apos;t miss your chance to finally take control of your retirement income — for the price of dinner out.</p>
          </div>
        </div>
      </section>

      {/* Section 10: Final CTA */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66] mb-6">
            Are You Ready to Stop Guessing&hellip; and Start Retiring With Confidence?
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4 mb-8">
            <p>You&apos;ve spent your whole life earning, saving, and sacrificing.</p>
            <p>Now it&apos;s time to make your money take care of <em>you.</em></p>
            <p>And that starts with a clear, simple, personalized income plan — one that works <strong>for you</strong>, not just for Wall Street.</p>
            <p>The Retirement Income Blueprint™ gives you that.</p>
            <p>No guesswork. No fear. No pressure. Just real clarity — finally.</p>
            
            <h3 className="text-2xl font-bold text-[#0D3B66] mt-8 mb-4">👉 Here&apos;s What You&apos;ll Get Instant Access To:</h3>
            <ul className="list-none space-y-2 text-left max-w-md mx-auto">
              <li>✅ The full <strong>Retirement Income Blueprint™</strong> digital training</li>
              <li>✅ The printable income workbook + step-by-step checklists</li>
              <li>✅ All 4 bonuses — including the Social Security Cheatsheet & Income Killers Mini-Class</li>
              <li>✅ Lifetime access</li>
              <li>✅ Our 60-day, no-questions-asked <strong>money-back guarantee</strong></li>
            </ul>
            
            <p className="text-xl font-semibold mt-6">All For Just $47 — One-Time.</p>
            <p>No subscriptions. No upsells. No pressure.</p>
            <p>Just a small investment that could pay off for the rest of your life.</p>
          </div>
          
          <button
            onClick={handleCTAClick}
            className="bg-[#F4D35E] hover:bg-[#EACB4F] text-[#0D3B66] px-12 py-6 rounded-lg font-bold text-2xl transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl mb-6"
            style={{ width: '600px', maxWidth: '100%' }}
          >
            Yes — I Want the Retirement Income Blueprint™
          </button>
          
          <p className="text-sm text-gray-600 mb-8">(Get instant access now for just $47)</p>
          
          <div className="bg-gray-100 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <p className="font-semibold mb-2">📝 P.S.</p>
            <p>Let&apos;s be honest&hellip;</p>
            <p>You could spend the next 6 months Googling income strategies, comparing opinions, and second-guessing your choices.</p>
            <p>Or&hellip; you could have a real plan, today.</p>
            <p>This isn&apos;t about getting rich. It&apos;s about feeling <em>secure.</em> And that feeling is worth everything.</p>
            <p className="font-semibold mt-4">Get the Retirement Income Blueprint™ now, and finally retire <em>on purpose</em> — not by accident.</p>
          </div>
        </div>
      </section>

      {/* Trust Badge Banner */}
      <section className="bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:block relative w-full h-32">
            <Image
              src="/images/offer/retirement-income-trust.png"
              alt="Trust indicators"
              fill
              className="object-contain"
            />
          </div>
          <div className="md:hidden relative w-full h-24">
            <Image
              src="/images/offer/retirement-income-trust-mobile.png"
              alt="Trust indicators"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* Checkout Iframe Section */}
      <section className="bg-white py-12 md:py-16" id="checkout-iframe">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66] mb-6 text-center">
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
              <Shield className="w-5 h-5 text-[#F4D35E] mr-2" />
              Secure Checkout
            </div>
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-[#F4D35E] mr-2" />
              SSL Encrypted
            </div>
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-[#F4D35E] mr-2" />
              Safe Payment
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-[#F4D35E] mr-2" />
              60-Day Money-Back Guarantee
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-2">Educational Disclaimer:</p>
            <p>
              The Retirement Income Blueprint™ is for educational purposes only and does not constitute individualized financial advice. 
              Consult with a qualified financial advisor before making any financial decisions. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
