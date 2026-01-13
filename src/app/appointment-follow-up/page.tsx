'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView } from '@/lib/temp-tracking';
import { AlertCircle } from 'lucide-react';

export default function AppointmentFollowUpPage() {
  const router = useRouter();
  useFunnelLayout();
  
  const [preferredTime, setPreferredTime] = useState('');
  const [preferredMethod, setPreferredMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeTracking();
    trackPageView('Appointment Follow-Up', '/appointment-follow-up');
    
    // Load existing data from sessionStorage
    const existingData = sessionStorage.getItem('final_expense_funnel_data');
    if (existingData) {
      try {
        const data = JSON.parse(existingData);
        setPreferredTime(data.preferredTime || '');
        setPreferredMethod(data.preferredMethod || '');
      } catch (e) {
        console.error('Error loading session data:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!preferredTime || !preferredMethod) {
      setError('Please answer all questions');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update sessionStorage
      const existingData = sessionStorage.getItem('final_expense_funnel_data');
      const funnelData = existingData ? JSON.parse(existingData) : {};
      funnelData.preferredTime = preferredTime;
      funnelData.preferredMethod = preferredMethod;
      funnelData.step = 'appointment_follow_up';
      funnelData.timestamp = new Date().toISOString();
      sessionStorage.setItem('final_expense_funnel_data', JSON.stringify(funnelData));

      // Track form submission
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit', {
          event_category: 'Final Expense Funnel',
          event_label: 'Appointment Follow-Up',
          page_path: '/appointment-follow-up'
        });
      }

      // Submit final data and redirect to quiz or guide
      const funnelDataComplete = JSON.parse(sessionStorage.getItem('final_expense_funnel_data') || '{}');
      
      // Submit to final expense quiz API
      if (funnelDataComplete.email && funnelDataComplete.phone) {
        await fetch('/api/leads/submit-without-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: funnelDataComplete.email,
            phoneNumber: funnelDataComplete.phone,
            firstName: funnelDataComplete.firstName,
            lastName: funnelDataComplete.lastName,
            quizAnswers: funnelDataComplete,
            funnelType: 'final-expense-quote',
            sessionId: sessionStorage.getItem('session_id') || null,
            utmParams: JSON.parse(sessionStorage.getItem('utm_params') || '{}')
          })
        });
      }

      // Navigate to guide or results
      router.push('/burial-insurance-guide');
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
            Schedule Your Consultation
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Help us find the best time to reach you
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What time of day works best for you? *
              </label>
              <div className="space-y-2">
                {['Morning (9am - 12pm)', 'Afternoon (12pm - 5pm)', 'Evening (5pm - 8pm)', 'Any time'].map((option) => (
                  <label key={option} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="preferredTime"
                      value={option}
                      checked={preferredTime === option}
                      onChange={(e) => setPreferredTime(e.target.value)}
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
                How would you prefer to be contacted? *
              </label>
              <div className="space-y-2">
                {['Phone call', 'Email', 'Text message', 'No preference'].map((option) => (
                  <label key={option} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="preferredMethod"
                      value={option}
                      checked={preferredMethod === option}
                      onChange={(e) => setPreferredMethod(e.target.value)}
                      className="mr-3"
                      required
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
              {isSubmitting ? 'Scheduling...' : 'Complete My Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

