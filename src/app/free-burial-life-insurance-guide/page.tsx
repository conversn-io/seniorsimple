'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView } from '@/lib/temp-tracking';
import { getEmailValidationState } from '@/utils/email-validation';
import { formatPhoneForInput, extractUSPhoneNumber } from '@/utils/phone-utils';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export default function FreeBurialLifeInsuranceGuidePage() {
  const router = useRouter();
  useFunnelLayout();
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailValidationState, setEmailValidationState] = useState<'empty' | 'invalid' | 'valid'>('empty');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    initializeTracking();
    trackPageView('Free Burial Life Insurance Guide Landing', '/free-burial-life-insurance-guide');
  }, []);

  const handleGetGuide = () => {
    // Track CTA click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        event_category: 'Final Expense Funnel',
        event_label: 'Get FREE Guide - Landing Page',
        page_path: '/free-burial-life-insurance-guide'
      });
    }
    
    // Show modal
    setShowModal(true);
    setProgress(25); // Start progress indicator
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    const state = getEmailValidationState(value);
    setEmailValidationState(state);
    
    if (state === 'invalid' && value.length > 0) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
    
    // Update progress
    if (value && firstName && lastName && phone) {
      setProgress(100);
    } else if (value || firstName || lastName || phone) {
      setProgress(50);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneForInput(value);
    setPhone(formatted);
    
    // Update progress
    if (email && firstName && lastName && formatted) {
      setProgress(100);
    } else if (email || firstName || lastName || formatted) {
      setProgress(50);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'firstName') setFirstName(value);
    if (field === 'lastName') setLastName(value);
    
    // Update progress
    if (email && phone && (field === 'firstName' ? value : firstName) && (field === 'lastName' ? value : lastName)) {
      setProgress(100);
    } else if (email || phone || firstName || lastName) {
      setProgress(50);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !phone) {
      setError('Please fill in all fields');
      return;
    }

    if (emailValidationState !== 'valid') {
      setError('Please enter a valid email address');
      return;
    }

    const digits = extractUSPhoneNumber(phone);
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Save to sessionStorage
      const funnelData = {
        firstName,
        lastName,
        email,
        phone,
        step: 'guide_confirmation',
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem('final_expense_funnel_data', JSON.stringify(funnelData));

      // Submit to API for lead capture
      const response = await fetch('/api/leads/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phoneNumber: phone,
          funnelType: 'final-expense-quote',
          sessionId: sessionStorage.getItem('session_id') || null,
          utmParams: JSON.parse(sessionStorage.getItem('utm_params') || '{}')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Track form submission
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit', {
          event_category: 'Final Expense Funnel',
          event_label: 'Guide Opt-In Modal',
          page_path: '/free-burial-life-insurance-guide'
        });
      }

      // Navigate to guide confirmation survey
      router.push('/insurance-guide-confirmation');
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
              Ready to Protect Your Family?
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Get Your FREE Burial Life Insurance Guide Today
            </p>
            <p className="text-lg mb-10 text-blue-50">
              Learn everything you need to know about final expense life insurance and how to protect your loved ones from unexpected costs.
            </p>
            
            {/* Primary CTA */}
            <button
              onClick={handleGetGuide}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all duration-200 mb-4 w-full md:w-auto"
            >
              Get The FREE Burial Life Insurance Guide
            </button>
            
            {/* Secondary CTA */}
            <div className="mt-6">
              <button
                onClick={handleGetGuide}
                className="text-blue-100 hover:text-white underline text-lg"
              >
                Click Here To Request Your Free Guide
              </button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              What You'll Learn in Your Free Guide
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">📘</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  Understanding Final Expense Insurance
                </h3>
                <p className="text-gray-600">
                  Learn what final expense insurance is, how it works, and why it's essential for protecting your family.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  Coverage & Cost Guide
                </h3>
                <p className="text-gray-600">
                  Discover how much coverage you need and what factors affect the cost of your policy.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  How to Apply
                </h3>
                <p className="text-gray-600">
                  Step-by-step guidance on applying for final expense insurance and getting approved quickly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-600 mb-4">
              <strong className="text-gray-800">100% Free</strong> • No Obligation • Instant Access
            </p>
            <p className="text-sm text-gray-500">
              Your information is secure and will never be shared with third parties.
            </p>
          </div>
        </section>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: '50%', backgroundColor: '#36596A' }}
                />
              </div>
            </div>

            {/* Modal Content */}
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
              Where should we send your free guide?
            </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* TrustedForm hidden input */}
                  <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" value="" />
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="modal-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="modal-firstName"
                  value={firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="modal-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="modal-lastName"
                  value={lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="modal-email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      emailValidationState === 'valid' 
                        ? 'border-green-500' 
                        : emailValidationState === 'invalid' 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                    }`}
                    required
                  />
                  {emailValidationState === 'valid' && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                  {emailValidationState === 'invalid' && emailError && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                  )}
                </div>
                {emailError && (
                  <p className="mt-1 text-xs text-red-600">{emailError}</p>
                )}
              </div>

              <div>
                <label htmlFor="modal-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="modal-phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Sending...' : 'Send My Free Guide'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By submitting this form, you agree to receive communications about final expense insurance. You can unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
