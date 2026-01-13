'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView } from '@/lib/temp-tracking';
import Link from 'next/link';

export default function AppointmentConfirmationPage() {
  const router = useRouter();
  useFunnelLayout();

  useEffect(() => {
    initializeTracking();
    trackPageView('Appointment Confirmation', '/appointmentconfirmation');
    
    // Track conversion event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        event_category: 'Final Expense Funnel',
        event_label: 'Appointment Confirmation',
        page_path: '/appointmentconfirmation'
      });
    }
  }, []);

  const handleReadGuide = () => {
    // Track guide link click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        event_category: 'Final Expense Funnel',
        event_label: 'Read Guide - Appointment Confirmation',
        page_path: '/appointmentconfirmation'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Thank You!
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Your information has been received successfully.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              What Happens Next?
            </h2>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>A licensed agent will contact you shortly to discuss your final expense insurance options</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>You'll receive personalized quotes based on your information</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Get answers to all your questions about coverage and costs</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link
              href="/burial-insurance-guide"
              onClick={handleReadGuide}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Click here to read our free burial insurance guide
            </Link>
            
            <p className="text-sm text-gray-500 mt-4">
              While you wait, learn everything you need to know about final expense insurance in our comprehensive guide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

