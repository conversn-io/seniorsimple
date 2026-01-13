'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView } from '@/lib/temp-tracking';
import FinalExpenseQuizEmbed from '@/components/pages/FinalExpenseQuizEmbed';
import Image from 'next/image';

export default function InsuranceGuideConfirmationPage() {
  const router = useRouter();
  useFunnelLayout();
  
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    initializeTracking();
    trackPageView('Guide Confirmation Survey', '/insurance-guide-confirmation');
    
    // Load firstName from sessionStorage
    const existingData = sessionStorage.getItem('final_expense_funnel_data');
    if (existingData) {
      try {
        const data = JSON.parse(existingData);
        setFirstName(data.firstName || '');
      } catch (e) {
        console.error('Error loading session data:', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Notification Bar - Directly under header nav */}
      <div className="w-full bg-green-100 border-b border-green-300 text-green-900 text-sm py-3 px-4 text-center">
        <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#2f6d46]">
          Success! Important next step for {firstName || 'you'} - please read!
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message Section */}
        <section className="mb-6">
          <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-800 text-center">
            Your Free Insurance Guide Will Be In Your Email Inbox Shortly
          </h3>
          <p className="text-sm text-gray-600 text-center mb-2">
            (Check The Spam Folder Just In Case)
          </p>
          <h4 className="text-base md:text-lg font-semibold text-gray-700 text-center mt-4 mb-6">
            In the meantime, answer a few basic questions below to request a FREE Custom Burial Insurance Quote to learn what your best options for life insurance based on your specific goals and situation.
          </h4>
        </section>

        {/* Embedded Quiz */}
        <section id="quiz-embed" className="mb-12 scroll-mt-20">
          <FinalExpenseQuizEmbed skipOTP={true} />
        </section>

        {/* What Will Be In Your Free Custom Quote Section */}
        <section className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">
            What Will Be In Your Free Custom Burial Life Insurance Quote?
          </h3>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <span className="text-green-600 mr-3 text-xl">✓</span>
              <span className="text-lg text-gray-700">
                Exactly how much life insurance you need to cover memorial expenses
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-3 text-xl">✓</span>
              <span className="text-lg text-gray-700">
                Approximately how much your policy would cost each month
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-3 text-xl">✓</span>
              <span className="text-lg text-gray-700">
                The best insurance provider for your type of policy
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-3 text-xl">✓</span>
              <span className="text-lg text-gray-700">
                Everything you need to make an informed decision about burial life insurance when you're ready to get it
              </span>
            </li>
          </ul>

          {/* 2 Column Block */}
          <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-lg shadow-lg p-8">
            <div className="order-2 md:order-1">
              {/* Image placeholder - replace with actual image from quote confirmation page */}
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-500">Quote Confirmation Image</p>
                <p className="text-sm text-gray-400 mt-2">Image from quote confirmation page</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h4 className="text-xl font-semibold mb-4 text-gray-800">
                You will also be assigned your own dedicated Life Insurance Specialist.
              </h4>
              <p className="text-lg text-gray-700">
                He or she will review your custom burial life insurance quote with you to make sure you understand what your best options for life insurance are and answer any questions you have.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
