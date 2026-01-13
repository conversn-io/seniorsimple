'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView } from '@/lib/temp-tracking';
import Link from 'next/link';

export default function BurialInsuranceGuidePage() {
  const router = useRouter();
  useFunnelLayout();

  useEffect(() => {
    initializeTracking();
    trackPageView('Burial Insurance Guide', '/burial-insurance-guide');
  }, []);

  const handleGetQuote = () => {
    // Track CTA click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        event_category: 'Final Expense Funnel',
        event_label: 'Get Quote - Guide Page',
        page_path: '/burial-insurance-guide'
      });
    }
    
    // Navigate to final expense quiz
    router.push('/final-expense-quote');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
            Ready to protect your family?{' '}
            <Link href="/final-expense-quote" className="underline hover:text-blue-200">
              Click Here To Request Your Custom Final Expense Life Insurance Quote Today
            </Link>
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* About Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800">About</h2>
              <p className="text-lg text-gray-700 mb-4">
                We were founded on the principle of family protection. Providing the precious gift of Burial Insurance to loved ones is one of the most important financial decisions anyone can make. And we're here to make sure it gets done the right way.
              </p>
              <p className="text-lg font-semibold mb-6 text-gray-800">
                Click the button below to request your FREE Custom Final Expense Life Insurance Quote today!
              </p>
              <button
                onClick={handleGetQuote}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                GET MY FREE CUSTOM FINAL EXPENSE LIFE INSURANCE QUOTE
              </button>
            </div>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-500">Guide Image Placeholder</p>
            </div>
          </div>
        </section>

        {/* Main Guide Title */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold mb-6 text-gray-800 text-center">
            Free Final Expense Life Insurance Guide - Everything You Need To Know About Final Expense Life Insurance
          </h2>
          
          {/* Video Section */}
          <div className="bg-gray-100 rounded-lg p-8 mb-8 text-center">
            <p className="text-gray-500 mb-4">Video: Burial Life Insurance Guide</p>
            <p className="text-sm text-gray-400">Video embed would go here</p>
          </div>
        </section>

        {/* What Is Final Expense Life Insurance */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">What Is Final Expense Life Insurance?</h2>
          <p className="text-lg text-gray-700 mb-4">
            Final expense life insurance is a small, permanent life insurance policy designed to cover the costs that come at the end of life—typically funeral and burial expenses. It's often marketed to seniors between the ages of 50 and 85 who want to ease the financial burden on their loved ones.
          </p>
          <p className="text-lg text-gray-700 mb-4">It's also known as:</p>
          <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 mb-4">
            <li>✅ Burial insurance</li>
            <li>✅ Funeral insurance</li>
            <li>✅ Senior life insurance (in some contexts)</li>
          </ul>
          <p className="text-lg text-gray-700">
            Coverage amounts typically range from $2,000 to $50,000, making it more affordable than traditional life insurance policies.
          </p>
        </section>

        {/* Why People Choose Final Expense Insurance */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Why People Choose Final Expense Insurance</h2>
          <p className="text-lg text-gray-700 mb-4">End-of-life expenses can add up quickly:</p>
          <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 mb-4">
            <li>✅ Average funeral cost (with burial): $7,000–$12,000</li>
            <li>✅ Cremation with memorial: $5,000–$7,000</li>
            <li>✅ Medical bills, legal fees, and debts: Varies</li>
            <li>✅ Travel or lodging for family members</li>
          </ul>
          <p className="text-lg text-gray-700">
            Many families aren't financially prepared to pay for these costs out of pocket. A final expense policy helps ensure that loved ones aren't left scrambling to cover these expenses during a difficult time.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">How It Works</h2>
          
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">1. Permanent Coverage</h3>
            <p className="text-lg text-gray-700 mb-2">
              Final expense insurance is a form of whole life insurance.
            </p>
            <p className="text-lg text-gray-700 mb-2">That means:</p>
            <ul className="list-disc list-inside space-y-1 text-lg text-gray-700 mb-4">
              <li>➡️ It never expires as long as you pay the premiums</li>
              <li>➡️ The death benefit is guaranteed</li>
              <li>➡️ Premiums are usually fixed for life</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">2. No Medical Exam Required</h3>
            <p className="text-lg text-gray-700 mb-2">Most policies are:</p>
            <ul className="list-disc list-inside space-y-1 text-lg text-gray-700 mb-4">
              <li>➡️ Simplified issue: A few health questions, no exam</li>
              <li>➡️ Guaranteed issue: No health questions, no exam, approval guaranteed</li>
            </ul>
            <p className="text-lg text-gray-700">
              Note: Guaranteed issue policies often come with a 2-3 year graded death benefit.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">3. Fast Payout</h3>
            <p className="text-lg text-gray-700">
              Once a claim is filed, beneficiaries typically receive the death benefit within days to a few weeks, depending on the insurer and claim process.
            </p>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Key Features and Terms to Understand</h2>
          
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">Death Benefit</h3>
            <p className="text-lg text-gray-700">
              The amount paid out to your beneficiary. This is tax-free and can be used for any purpose—not just funeral costs.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">Premiums</h3>
            <ul className="list-disc list-inside space-y-1 text-lg text-gray-700">
              <li>➡️ Typically monthly</li>
              <li>➡️ Stay level for life (unless you choose a policy with increasing premiums)</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">Cash Value</h3>
            <p className="text-lg text-gray-700 mb-2">
              Some final expense policies build cash value over time, which can be:
            </p>
            <ul className="list-disc list-inside space-y-1 text-lg text-gray-700">
              <li>➡️ Borrowed against</li>
              <li>➡️ Used to pay premiums (if you're short on cash)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">Graded Death Benefit</h3>
            <p className="text-lg text-gray-700 mb-2">For guaranteed issue policies:</p>
            <ul className="list-disc list-inside space-y-1 text-lg text-gray-700">
              <li>➡️ Full benefits only paid after 2 or 3 years</li>
              <li>➡️ If death occurs during that time from natural causes, the insurance company may only return premiums paid, plus interest</li>
              <li>➡️ Accidental death is usually covered from day one</li>
            </ul>
          </div>
        </section>

        {/* How Much Coverage */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">How Much Coverage Do You Need?</h2>
          <p className="text-lg text-gray-700 mb-4">Here's a basic breakdown:</p>
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <p className="text-lg font-semibold mb-2 text-gray-800">Expense Type & Estimated Cost:</p>
            <ul className="list-disc list-inside space-y-1 text-lg text-gray-700">
              <li>✅ Funeral & Burial = $7,000–$12,000</li>
              <li>✅ Cremation = $5,000–$7,000</li>
              <li>✅ Medical Bills = Varies</li>
              <li>✅ Credit Card Debt = Varies</li>
              <li>✅ Legal/Probate Fees = $1,000–$3,000</li>
            </ul>
          </div>
          <p className="text-lg text-gray-700">
            A good rule of thumb is to get coverage of $10,000–$25,000, depending on your specific needs and budget.
          </p>
        </section>

        {/* Who Should Consider */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Who Should Consider Final Expense Insurance?</h2>
          <ul className="list-disc list-inside space-y-2 text-lg text-gray-700">
            <li>✅ You're between 50 and 85 years old</li>
            <li>✅ You don't already have permanent life insurance</li>
            <li>✅ You don't want to burden your family with funeral expenses</li>
            <li>✅ You don't want to deal with medical exams</li>
            <li>✅ You've been denied coverage for other types of insurance</li>
            <li>✅ You want a simple, affordable way to leave something behind</li>
          </ul>
        </section>

        {/* Cost Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">How Much Does Final Expense Life Insurance Cost?</h2>
          <p className="text-lg text-gray-700 mb-4">
            One of the biggest advantages of final expense life insurance is its affordability—especially when compared to larger whole life or term life insurance policies. However, prices can vary significantly based on a few key personal and policy-related factors.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Here's a general idea of what you might expect to pay for $10,000–$15,000 in coverage:
          </p>
          <div className="bg-gray-50 rounded-lg p-6 mb-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-gray-800 font-semibold">Age Range</th>
                  <th className="pb-2 text-gray-800 font-semibold">Non-Smoker</th>
                  <th className="pb-2 text-gray-800 font-semibold">Smoker</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="py-2">50–55</td>
                  <td className="py-2">$25–$40/month</td>
                  <td className="py-2">$35–$60/month</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">60–65</td>
                  <td className="py-2">$35–$55/month</td>
                  <td className="py-2">$50–$75/month</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">70–75</td>
                  <td className="py-2">$45–$75/month</td>
                  <td className="py-2">$65–$100/month</td>
                </tr>
                <tr>
                  <td className="py-2">80–85</td>
                  <td className="py-2">$75–$130/month</td>
                  <td className="py-2">$95–$160/month</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Factors That Impact Cost */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Factors That Impact Cost</h2>
          <p className="text-lg text-gray-700 mb-4">
            Several factors influence how much you'll pay for final expense life insurance:
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">1. Age</h3>
              <p className="text-lg text-gray-700">The older you are, the higher your premium. Rates increase with age because the risk to the insurer increases.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">2. Gender</h3>
              <p className="text-lg text-gray-700">Women typically pay less than men because they tend to live longer.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">3. Health</h3>
              <p className="text-lg text-gray-700">If applying for simplified issue, your answers to health questions can affect your rate. Serious health issues may push you toward guaranteed issue, which costs more.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">4. Tobacco Use</h3>
              <p className="text-lg text-gray-700">Smokers often pay 30–50% more than non-smokers. Even occasional use of cigarettes or chewing tobacco counts.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">5. Policy Type</h3>
              <p className="text-lg text-gray-700">Simplified Issue (health questions, no exam): lower premiums if in decent health. Guaranteed Issue (no questions, no exam): higher premiums due to higher risk.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">6. Coverage Amount</h3>
              <p className="text-lg text-gray-700">Naturally, more coverage means a higher premium. Many people choose $10,000–$25,000 in coverage to balance affordability with need.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">7. Company and State</h3>
              <p className="text-lg text-gray-700">Insurance premiums can vary based on the insurer's underwriting guidelines and your state of residence.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">8. Payment Frequency</h3>
              <p className="text-lg text-gray-700">Monthly is most common, but some insurers offer annual or quarterly payments at a slight discount.</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <p className="text-lg font-semibold text-gray-800 mb-2">Cost-Saving Tip</p>
            <p className="text-lg text-gray-700">
              If you're relatively healthy, try to qualify for simplified issue instead of guaranteed issue. You'll likely get better rates and full coverage from day one.
            </p>
          </div>
        </section>

        {/* How to Apply */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">How to Apply</h2>
          <p className="text-lg text-gray-700 mb-4">Applying is usually quick and simple:</p>
          <ul className="list-disc list-inside space-y-2 text-lg text-gray-700">
            <li>✅ Choose a trusted insurer or agent</li>
            <li>✅ Answer a few questions (or skip them for guaranteed issue)</li>
            <li>✅ Select your coverage amount and premium</li>
            <li>✅ Designate a beneficiary</li>
            <li>✅ Make your first payment</li>
            <li>✅ Receive your policy in the mail</li>
          </ul>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-center text-white mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Click the button below to request your FREE Custom Final Expense Life Insurance Quote to learn your best options for protecting your loved ones!
          </h2>
          <button
            onClick={handleGetQuote}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all duration-200 mt-4"
          >
            GET MY FREE CUSTOM FINAL EXPENSE LIFE INSURANCE QUOTE
          </button>
        </section>
      </div>
    </div>
  );
}

