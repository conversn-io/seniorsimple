'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackPageView } from '@/lib/temp-tracking';
import { Phone, Download, Play, CheckCircle, Clock, User, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface QuoteData {
  totalSavings: number;
  allocationAmount: number;
  allocationPercent: number;
  monthlyIncome: {
    conservative: number;
    current: number;
    optimistic: number;
  };
  ageFactor: number;
  currentRate: number;
  lastUpdated: string;
}

export default function QuoteSubmittedPage() {
  const router = useRouter();
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  useEffect(() => {
    // Track page view
    trackPageView('SeniorSimple FIA Quote Submitted', '/quote-submitted');
    
    console.log('🎯 FIA Quote Submitted Page Loaded:', {
      timestamp: new Date().toISOString(),
      url: window.location.href
    });

    // Try to get quote data from session storage or URL params
    const storedQuoteData = sessionStorage.getItem('fia_quote_data');
    if (storedQuoteData) {
      try {
        const parsedData = JSON.parse(storedQuoteData);
        setQuoteData(parsedData);
        console.log('📊 Quote Data Retrieved:', parsedData);
      } catch (error) {
        console.error('❌ Error parsing quote data:', error);
      }
    }

    // Get phone number from session storage for display
    const storedPhone = sessionStorage.getItem('phone_number');
    if (storedPhone) {
      // Extract last 4 digits
      const digits = storedPhone.replace(/\D/g, '');
      if (digits.length >= 4) {
        setPhoneNumber(digits.slice(-4));
      }
    }
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FIA Quote Request Submitted!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your interest in Fixed Indexed Annuities. Our specialists will contact you within 24 hours with your personalized quote.
          </p>
        </div>

        {/* Quote Details Section */}
        {quoteData && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Your FIA Quote Summary
            </h2>
            
            {/* Income Projections */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Projected Monthly Income
              </h3>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Based on your ${formatNumber(quoteData.allocationAmount)} FIA allocation:
                </p>
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-[#36596A]">
                    ${formatNumber(quoteData.monthlyIncome.conservative)}
                  </span>
                  <span className="text-2xl text-gray-500 mx-4"> - </span>
                  <span className="text-4xl font-bold text-[#36596A]">
                    ${formatNumber(quoteData.monthlyIncome.optimistic)}
                  </span>
                  <span className="text-2xl text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-sm text-gray-600">
                  Current FIA rate: {(quoteData.currentRate * 100).toFixed(1)}% | 
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Quote Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Allocation Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Savings:</span>
                  <span className="font-medium">${formatNumber(quoteData.totalSavings)}</span>
                </div>
                <div className="flex justify-between">
                  <span>FIA Allocation:</span>
                  <span className="font-medium">{quoteData.allocationPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Allocation Amount:</span>
                  <span className="font-medium">${formatNumber(quoteData.allocationAmount)}</span>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
              <p className="text-sm text-yellow-800">
                <strong>Disclaimer:</strong> This is only an estimate based on the information you provided. 
                A licensed professional will walk you through all your options and provide personalized guidance 
                based on your complete financial situation.
              </p>
            </div>
          </div>
        )}

        {/* 3 Steps Vertical */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What happens next?
          </h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-[#36596A] font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Expect a call within 24 hours
                </h3>
                <p className="text-gray-600">
                  {phoneNumber ? (
                    <>We'll call you at the number ending in <strong>****{phoneNumber}</strong> within the next 24 hours.</>
                  ) : (
                    <>We'll call you at the number you provided within the next 24 hours.</>
                  )}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-[#36596A] font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Schedule your consultation
                </h3>
                <p className="text-gray-600 mb-4">
                  If you'd like to schedule a specific time, use our scheduling tool below.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-[#36596A] mr-2" />
                      <span className="text-gray-700">Schedule Consultation</span>
                    </div>
                    <button className="bg-[#36596A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a4a5a] transition-colors">
                      Choose Time
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-[#36596A] font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Get more information and education
                </h3>
                <p className="text-gray-600 mb-4">
                  Download our free guide "The Retirement Revolution" and watch our educational webinar.
                </p>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Download className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-gray-700">Download Free Guide</span>
                      </div>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Play className="w-5 h-5 text-red-600 mr-2" />
                        <span className="text-gray-700">Watch Webinar</span>
                      </div>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Our FIA Specialists?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <User className="w-6 h-6 text-[#36596A] mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Licensed Professionals</h3>
                <p className="text-gray-600 text-sm">Our specialists are fully licensed and experienced in FIA products.</p>
              </div>
            </div>
            <div className="flex items-start">
              <BookOpen className="w-6 h-6 text-[#36596A] mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Educational Approach</h3>
                <p className="text-gray-600 text-sm">We educate you on all options before making any recommendations.</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-[#36596A] mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">No Obligation</h3>
                <p className="text-gray-600 text-sm">Free consultation with no pressure to purchase anything.</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="w-6 h-6 text-[#36596A] mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Personalized Service</h3>
                <p className="text-gray-600 text-sm">One-on-one consultation tailored to your specific needs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">What is a Fixed Indexed Annuity?</h3>
              <p className="text-gray-600 text-sm">
                A Fixed Indexed Annuity (FIA) is a retirement savings product that offers the potential for growth 
                based on market performance while providing protection against market losses.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">How long does it take to get my quote?</h3>
              <p className="text-gray-600 text-sm">
                We typically provide personalized quotes within 24 hours of your request. 
                Our specialists will contact you directly with your options.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Is there any cost for the consultation?</h3>
              <p className="text-gray-600 text-sm">
                No, our consultation is completely free with no obligation to purchase anything. 
                We're here to educate and help you make informed decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="bg-[#36596A] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#2a4a5a] transition-colors"
          >
            Return to Homepage
          </button>
          <button
            onClick={() => router.push('/quiz')}
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Take Retirement Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
