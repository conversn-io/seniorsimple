'use client';

import { useEffect } from 'react';
import { initializeTracking, trackPageView } from '@/lib/temp-tracking';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';

export default function FinalExpenseThankYouPage() {
  useFunnelLayout();

  useEffect(() => {
    // Initialize tracking
    initializeTracking();
    trackPageView('Final Expense Thank You', '/final-expense-quote/thank-you');
    
    // Track thank you view event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'fe_thankyou_view', {
        funnel_type: 'final-expense-quote'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Thanks — you're connected
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-700 mb-8">
            A licensed final expense agent will call you shortly to review options.
          </p>

          {/* Bullet Points */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">Typical call timeframe: within 24 hours</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg">No obligation</span>
              </li>
            </ul>
          </div>

          {/* Additional Info */}
          <div className="text-gray-600 space-y-4">
            <p className="text-lg">
              Your information has been securely submitted and a licensed final expense insurance agent will reach out to discuss your options.
            </p>
            <p className="text-base">
              If you have any questions before your call, you can reach out to us directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

