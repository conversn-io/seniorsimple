'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView } from '@/lib/temp-tracking';
import { AlertCircle } from 'lucide-react';

export default function NewBurialLifeInsuranceQuotePage() {
  const router = useRouter();
  useFunnelLayout();
  
  const [tobaccoUse, setTobaccoUse] = useState('');
  const [coveragePurpose, setCoveragePurpose] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeTracking();
    trackPageView('New Burial Life Insurance Quote', '/new-burial-life-insurance-quote');
    
    // Load existing data from sessionStorage
    const existingData = sessionStorage.getItem('final_expense_funnel_data');
    if (existingData) {
      try {
        const data = JSON.parse(existingData);
        setTobaccoUse(data.tobaccoUse || '');
        setCoveragePurpose(data.coveragePurpose || []);
      } catch (e) {
        console.error('Error loading session data:', e);
      }
    }
  }, []);

  const handleCheckboxChange = (value: string) => {
    setCoveragePurpose(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tobaccoUse || coveragePurpose.length === 0) {
      setError('Please answer all questions');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update sessionStorage
      const existingData = sessionStorage.getItem('final_expense_funnel_data');
      const funnelData = existingData ? JSON.parse(existingData) : {};
      funnelData.tobaccoUse = tobaccoUse;
      funnelData.coveragePurpose = coveragePurpose;
      funnelData.step = 'new_quote_request';
      funnelData.timestamp = new Date().toISOString();
      sessionStorage.setItem('final_expense_funnel_data', JSON.stringify(funnelData));

      // Track form submission
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit', {
          event_category: 'Final Expense Funnel',
          event_label: 'New Quote Request',
          page_path: '/new-burial-life-insurance-quote'
        });
      }

      // Navigate to follow-up
      router.push('/appointment-follow-up');
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
            Get Your Personalized Quote
          </h1>
          <p className="text-center text-gray-600 mb-8">
            A few more questions to get you the best rates
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you use tobacco products? *
              </label>
              <div className="space-y-2">
                {['No, never', 'Yes, occasionally', 'Yes, regularly'].map((option) => (
                  <label key={option} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="tobaccoUse"
                      value={option}
                      checked={tobaccoUse === option}
                      onChange={(e) => setTobaccoUse(e.target.value)}
                      className="mr-3"
                      required
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is the primary purpose of this coverage? (Select all that apply) *
              </label>
              <div className="space-y-2">
                {[
                  'Funeral & Burial Costs',
                  'Medical Bills',
                  'Credit Card Debt',
                  'Other Debts',
                  'Leave Money to Family',
                  'Other'
                ].map((option) => (
                  <label key={option} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      value={option}
                      checked={coveragePurpose.includes(option)}
                      onChange={() => handleCheckboxChange(option)}
                      className="mr-3"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Processing...' : 'Get My Personalized Quote'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

