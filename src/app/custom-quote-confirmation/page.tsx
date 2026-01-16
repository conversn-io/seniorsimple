'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView } from '@/lib/temp-tracking';
import { formatPhoneForInput, extractUSPhoneNumber } from '@/utils/phone-utils';
import { AlertCircle } from 'lucide-react';

export default function CustomQuoteConfirmationPage() {
  const router = useRouter();
  useFunnelLayout();
  
  const [ageRange, setAgeRange] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeTracking();
    trackPageView('Custom Quote Confirmation', '/custom-quote-confirmation');
    
    // Load existing data from sessionStorage
    const existingData = sessionStorage.getItem('final_expense_funnel_data');
    if (existingData) {
      try {
        const data = JSON.parse(existingData);
        setAgeRange(data.ageRange || '');
        setCoverageAmount(data.coverageAmount || '');
        setHealthStatus(data.healthStatus || '');
      } catch (e) {
        console.error('Error loading session data:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ageRange || !coverageAmount || !healthStatus) {
      setError('Please answer all questions');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update sessionStorage with additional data
      const existingData = sessionStorage.getItem('final_expense_funnel_data');
      const funnelData = existingData ? JSON.parse(existingData) : {};
      funnelData.ageRange = ageRange;
      funnelData.coverageAmount = coverageAmount;
      funnelData.healthStatus = healthStatus;
      funnelData.step = 'custom_quote_confirmation';
      funnelData.timestamp = new Date().toISOString();
      sessionStorage.setItem('final_expense_funnel_data', JSON.stringify(funnelData));

      // Track form submission
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit', {
          event_category: 'Final Expense Funnel',
          event_label: 'Custom Quote Confirmation',
          page_path: '/custom-quote-confirmation'
        });
      }

      // Navigate to appointment confirmation
      router.push('/appointmentconfirmation');
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
            Get Your Custom Quote
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Help us personalize your final expense insurance quote
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TrustedForm hidden input */}
            <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" value="" />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-2">
                What is your age range? *
              </label>
              <select
                id="ageRange"
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select age range</option>
                <option value="50-59">50-59</option>
                <option value="60-69">60-69</option>
                <option value="70-79">70-79</option>
                <option value="80-85">80-85</option>
                <option value="over-85">Over 85</option>
              </select>
            </div>

            <div>
              <label htmlFor="coverageAmount" className="block text-sm font-medium text-gray-700 mb-2">
                How much coverage are you looking for? *
              </label>
              <select
                id="coverageAmount"
                value={coverageAmount}
                onChange={(e) => setCoverageAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select coverage amount</option>
                <option value="5000-10000">$5,000 - $10,000</option>
                <option value="10000-15000">$10,000 - $15,000</option>
                <option value="15000-25000">$15,000 - $25,000</option>
                <option value="25000-50000">$25,000 - $50,000</option>
                <option value="over-50000">Over $50,000</option>
              </select>
            </div>

            <div>
              <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700 mb-2">
                How would you describe your current health? *
              </label>
              <select
                id="healthStatus"
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select health status</option>
                <option value="excellent">Excellent - No major health issues</option>
                <option value="good">Good - Managed conditions, no recent hospitalizations</option>
                <option value="fair">Fair - Some chronic conditions, but stable</option>
                <option value="poor">Poor - Serious health issues, recent hospitalizations</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Processing...' : 'Continue to Get My Quote'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

