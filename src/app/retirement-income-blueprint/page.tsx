'use client';

import { useEffect } from 'react';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView, trackGA4Event } from '@/lib/temp-tracking';

export default function RetirementIncomeBlueprintPage() {
  useFunnelLayout();

  useEffect(() => {
    initializeTracking();
    trackPageView('Retirement Income Blueprint Checkout', '/retirement-income-blueprint');
    
    // Track checkout page view
    trackGA4Event('checkout_view', {
      product: 'retirement_income_blueprint',
      price: 47,
      page_path: '/retirement-income-blueprint',
      event_category: 'ecommerce'
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#36596A] mb-4">
            Get Your Retirement Income Blueprint™
          </h1>
          <p className="text-lg text-gray-700">
            Complete guide to creating tax-efficient, inflation-protected retirement income
          </p>
        </div>

        {/* Iframe Container */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="w-full" style={{ minHeight: '800px' }}>
            <iframe
              src="https://offers.callready.io/2-step-order-form-page"
              className="w-full border-0"
              style={{ 
                minHeight: '800px',
                width: '100%',
                border: 'none'
              }}
              title="Retirement Income Blueprint Order Form"
              allow="payment"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure Checkout
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              60-Day Money-Back Guarantee
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Instant Digital Access
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6 text-sm text-gray-600">
          <p className="font-semibold mb-2">Educational Disclaimer:</p>
          <p>
            The Retirement Income Blueprint™ is for educational purposes only and does not constitute individualized financial advice. 
            Consult with a qualified financial advisor before making any financial decisions. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </div>
  );
}

